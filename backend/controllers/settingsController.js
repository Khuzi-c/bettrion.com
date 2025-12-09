const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('setting_key', key)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        res.json({ success: true, data: data || null });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all settings
exports.getAllSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convert to key-value object
        const settings = {};
        data.forEach(item => {
            settings[item.setting_key] = item.setting_value;
        });

        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update setting
exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, updated_by } = req.body;

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({
                setting_key: key,
                setting_value: value,
                updated_by: updated_by || 'Admin',
                updated_at: new Date().toISOString()
            }, { onConflict: 'setting_key' })
            .select();

        if (error) throw error;
        res.json({ success: true, data: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Toggle maintenance mode
exports.toggleMaintenanceMode = async (req, res) => {
    try {
        const { enabled } = req.body;

        const { data, error } = await supabase
            .from('site_settings')
            .upsert({
                setting_key: 'maintenance_mode',
                setting_value: enabled ? 'true' : 'false',
                updated_by: 'Admin',
                updated_at: new Date().toISOString()
            }, { onConflict: 'setting_key' })
            .select();

        if (error) throw error;
        res.json({ success: true, data: data[0], maintenanceMode: enabled });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
