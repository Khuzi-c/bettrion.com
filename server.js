require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
// Create uploads directory if it serves static files from there (as per prompt)
app.use('/uploads', express.static(path.join(__dirname, 'backend/data/uploads')));

// --- Supabase Setup ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- Bot Setup ---
// Bot is initialized in backend/bot/bot.js which is loaded via routes/controllers
const { client } = require('./backend/bot/bot');

// --- Routes ---
const apiRouter = require('./backend/routes/api');
app.use('/api', apiRouter);

const transcriptRouter = require('./backend/routes/transcripts');
app.use('/', transcriptRouter);

// --- Maintenance Mode Middleware ---
app.use(async (req, res, next) => {
    // Skip maintenance check for admin pages and API
    if (req.path.startsWith('/admin') || req.path.startsWith('/api') || req.path.startsWith('/assets')) {
        return next();
    }

    try {
        const { data } = await supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', 'maintenance_mode')
            .single();

        if (data && data.setting_value === 'true') {
            return res.sendFile(path.join(__dirname, 'frontend/maintenance.html'));
        }
    } catch (err) {
        // If table doesn't exist or error, continue normally
        console.log('Maintenance check skipped:', err.message);
    }

    next();
});

// --- Clean URL Routing (remove .html extensions) ---
// Admin login (no auth required)
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/admin/login.html'));
});

// Other admin pages
app.get('/admin/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, `frontend/admin/${page}.html`));
});

// Dynamic casino pages: /casinos/casino-slug
app.get('/casinos/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/casino-page.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, `frontend/${page}.html`);
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, 'frontend/index.html'));
    }
});

// Fallback for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Initialize auto-backup system
    initializeBackupScheduler();
});

// --- Auto-Backup Scheduler ---
function initializeBackupScheduler() {
    const { performBackup, cleanOldBackups } = require('./backend/services/backupService');

    // Run initial backup on startup (if no backup in last 6 hours)
    setTimeout(async () => {
        console.log('🔄 Checking for initial backup...');
        const { data } = await supabase
            .from('backups')
            .select('created_at')
            .eq('backup_type', 'auto')
            .order('created_at', { ascending: false })
            .limit(1);

        if (!data || data.length === 0) {
            console.log('📦 Creating initial backup...');
            await performBackup('auto');
        } else {
            const lastBackup = new Date(data[0].created_at);
            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
            if (lastBackup < sixHoursAgo) {
                console.log('📦 Last backup is old, creating new one...');
                await performBackup('auto');
            }
        }
    }, 5000); // Wait 5 seconds after server start

    // Schedule auto-backup every 6 hours (21600000 ms)
    setInterval(async () => {
        console.log('📦 Running scheduled auto-backup...');
        await performBackup('auto');
    }, 6 * 60 * 60 * 1000);

    // Clean old backups daily
    setInterval(async () => {
        console.log('🧹 Running backup cleanup...');
        await cleanOldBackups();
    }, 24 * 60 * 60 * 1000);

    console.log('✅ Auto-backup scheduler initialized (6-hour interval)');
}

// Export for easier testing/importing if needed
module.exports = { app, supabase, client };
