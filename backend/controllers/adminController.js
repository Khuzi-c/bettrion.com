const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Get admin statistics
 */
exports.getStats = async (req, res) => {
    try {
        const [casinos, users, tickets, active] = await Promise.all([
            supabase.from('casinos').select('id', { count: 'exact', head: true }),
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
            supabase.from('active_sessions').select('id', { count: 'exact', head: true })
        ]);

        res.json({
            success: true,
            data: {
                casinos: casinos.count || 0,
                users: users.count || 0,
                tickets: tickets.count || 0,
                active: active.count || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get all users with IP/country tracking
 */
exports.getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get analytics data
 */
exports.getAnalytics = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const { data, error } = await supabase
            .from('analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Track page visit
 */
exports.trackVisit = async (req, res) => {
    try {
        const { page_url, user_agent, referrer } = req.body;
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

        // Get country from IP (you can integrate with ipapi.co or similar)
        let country = 'Unknown';
        try {
            const ipRes = await fetch(`https://ipapi.co/${ip_address}/json/`);
            const ipData = await ipRes.json();
            country = ipData.country_name || 'Unknown';
        } catch (e) {
            // Silently fail if IP lookup fails
        }

        // Track in analytics
        await supabase.from('analytics').insert([{
            ip_address,
            country,
            page_url,
            user_agent,
            referrer
        }]);

        // Update active sessions
        await supabase.from('active_sessions').upsert([{
            ip_address,
            country,
            last_seen: new Date().toISOString()
        }], { onConflict: 'ip_address' });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
