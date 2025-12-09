const { createClient } = require('@supabase/supabase-js');
const ticketSync = require('./ticketSyncController');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


exports.createTicket = async (req, res) => {
    try {
        const { user_id, guest_email, subject, category, priority, initial_message, description } = req.body;

        // Generate short_id (8 chars)
        const short_id = Math.random().toString(36).substring(2, 10).toUpperCase();

        // 1. Create Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert([{
                user_id: user_id || null,
                guest_email: guest_email || null,
                short_id: short_id,
                subject,
                category,
                priority: priority || 'MEDIUM',
                status: 'OPEN'
            }])
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 2. Create Discord Thread (non-blocking)
        ticketSync.createDiscordThread(ticket.id, {
            subject,
            description: initial_message || subject,
            guest_email,
            priority: priority || 'MEDIUM',
            status: 'OPEN'
        }).catch(err => console.error('Discord thread creation failed:', err));

        // 3. Create Initial Message
        if (initial_message) {
            const { data: message, error: msgError } = await supabase
                .from('messages')
                .insert([{
                    ticket_id: ticket.id,
                    sender_role: 'USER',
                    content: initial_message
                }])
                .select()
                .single();

            if (msgError) {
                console.error("Error creating initial message:", msgError);
            } else {
                // Sync initial message to Discord (non-blocking)
                ticketSync.syncWebToDiscord(ticket.id, message).catch(err =>
                    console.error('Failed to sync message to Discord:', err)
                );
            }
        }

        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.closeTicket = async (req, res) => {
    try {
        const { ticket_id } = req.body;

        // Update ticket status to CLOSED
        const { error } = await supabase
            .from('tickets')
            .update({ status: 'CLOSED' })
            .eq('id', ticket_id);

        if (error) throw error;

        // Update Discord thread status
        const ticketSync = require('./ticketSyncController');
        await ticketSync.updateTicketStatus(ticket_id, 'CLOSED');

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const { user_id } = req.query; // Filter by user if provided
        let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });

        if (user_id) {
            query = query.eq('user_id', user_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTicketMessages = async (req, res) => {
    try {
        const { ticket_id } = req.params;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('ticket_id', ticket_id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { ticket_id, sender_role, content, attachments } = req.body;
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                ticket_id,
                sender_role, // 'USER' or 'ADMIN'
                content,
                attachments: attachments || []
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update ticket status (OPEN, PAUSED, CLOSED)
 */
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'OPEN', 'PAUSED', 'CLOSED'

        const { data, error } = await supabase
            .from('tickets')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Delete ticket
 */
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Ticket deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
