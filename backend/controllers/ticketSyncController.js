const { createClient } = require('@supabase/supabase-js');
const { client } = require('../bot/bot');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Discord channel IDs (configure these in .env)
const SUPPORT_CHANNEL_ID = process.env.DISCORD_SUPPORT_CHANNEL_ID || '1234567890'; // Replace with actual ID
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID || '1234567890'; // Replace with actual ID

// Create Discord thread when ticket is created
exports.createDiscordThread = async (ticketId, ticketData) => {
    try {
        // Check if bot is ready
        if (!client || !client.isBotReady || !client.isBotReady()) {
            console.log('Discord bot not ready, skipping thread creation');
            return null;
        }

        const channel = await client.channels.fetch(SUPPORT_CHANNEL_ID);
        if (!channel) {
            console.error('Support channel not found');
            return null;
        }

        // Create embed for ticket
        const embed = new EmbedBuilder()
            .setColor('#f6d56a')
            .setTitle(`🎫 New Support Ticket #${ticketId.substring(0, 8)}`)
            .setDescription(ticketData.description || 'No description provided')
            .addFields(
                { name: '📧 Email', value: ticketData.guest_email || 'Not provided', inline: true },
                { name: '⚡ Priority', value: ticketData.priority || 'MEDIUM', inline: true },
                { name: '📊 Status', value: ticketData.status || 'OPEN', inline: true },
                { name: '📝 Subject', value: ticketData.subject || 'No subject', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Bettrion Support System' });

        // Create action buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_assign_${ticketId}`)
                    .setLabel('Assign to Me')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👤'),
                new ButtonBuilder()
                    .setCustomId(`ticket_close_${ticketId}`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId(`ticket_priority_${ticketId}`)
                    .setLabel('Set Priority')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚡')
            );

        // Create thread
        const thread = await channel.threads.create({
            name: `🎫 ${ticketData.subject || 'Support Ticket'} - #${ticketId.substring(0, 8)}`,
            autoArchiveDuration: 1440, // 24 hours
            type: ChannelType.PrivateThread,
            reason: `Support ticket #${ticketId}`
        });

        // Send initial message with embed and buttons
        await thread.send({
            content: `<@&${STAFF_ROLE_ID}> New ticket created!`,
            embeds: [embed],
            components: [row]
        });

        // Save mapping to database
        await supabase
            .from('ticket_discord_mapping')
            .insert({
                ticket_id: ticketId,
                discord_thread_id: thread.id,
                discord_channel_id: channel.id
            });

        // Update ticket with thread ID
        await supabase
            .from('tickets')
            .update({ discord_thread_id: thread.id })
            .eq('id', ticketId);

        console.log(`✅ Created Discord thread ${thread.id} for ticket ${ticketId}`);
        return thread.id;

    } catch (err) {
        console.error('Error creating Discord thread:', err);
        return null;
    }
};

// Sync web message to Discord
exports.syncWebToDiscord = async (ticketId, message) => {
    try {
        // Get thread ID from mapping
        const { data: mapping } = await supabase
            .from('ticket_discord_mapping')
            .select('discord_thread_id')
            .eq('ticket_id', ticketId)
            .single();

        if (!mapping || !mapping.discord_thread_id) {
            console.log('No Discord thread found for ticket:', ticketId);
            return false;
        }

        const thread = await client.channels.fetch(mapping.discord_thread_id);
        if (!thread) {
            console.error('Thread not found:', mapping.discord_thread_id);
            return false;
        }

        // Create embed for message
        const embed = new EmbedBuilder()
            .setColor(message.sender_role === 'USER' ? '#3b82f6' : '#10b981')
            .setAuthor({
                name: message.sender_role === 'USER' ? '👤 User' : '👨‍💼 Staff',
            })
            .setDescription(message.content)
            .setTimestamp(new Date(message.created_at))
            .setFooter({ text: 'Via Website' });

        await thread.send({ embeds: [embed] });
        console.log(`✅ Synced message to Discord thread ${thread.id}`);
        return true;

    } catch (err) {
        console.error('Error syncing to Discord:', err);
        return false;
    }
};

// Sync Discord message to web
exports.syncDiscordToWeb = async (threadId, discordMessage) => {
    try {
        // Get ticket ID from mapping
        const { data: mapping } = await supabase
            .from('ticket_discord_mapping')
            .select('ticket_id')
            .eq('discord_thread_id', threadId)
            .single();

        if (!mapping || !mapping.ticket_id) {
            console.log('No ticket found for thread:', threadId);
            return false;
        }

        // Don't sync bot messages
        if (discordMessage.author.bot) {
            return false;
        }

        // Insert message into database
        const { error } = await supabase
            .from('messages')
            .insert({
                ticket_id: mapping.ticket_id,
                sender_role: 'ADMIN',
                content: discordMessage.content,
                created_at: discordMessage.createdAt.toISOString()
            });

        if (error) {
            console.error('Error saving message to database:', error);
            return false;
        }

        console.log(`✅ Synced Discord message to ticket ${mapping.ticket_id}`);
        return true;

    } catch (err) {
        console.error('Error syncing to web:', err);
        return false;
    }
};

// Update ticket status and sync to Discord
exports.updateTicketStatus = async (ticketId, newStatus) => {
    try {
        // Get thread ID
        const { data: mapping } = await supabase
            .from('ticket_discord_mapping')
            .select('discord_thread_id')
            .eq('ticket_id', ticketId)
            .single();

        if (!mapping || !mapping.discord_thread_id) {
            return false;
        }

        const thread = await client.channels.fetch(mapping.discord_thread_id);
        if (!thread) {
            return false;
        }

        // Send status update message
        const statusEmoji = {
            'OPEN': '🟢',
            'IN_PROGRESS': '🟡',
            'CLOSED': '🔴'
        };

        const embed = new EmbedBuilder()
            .setColor(newStatus === 'CLOSED' ? '#ef4444' : '#f59e0b')
            .setTitle('📊 Status Updated')
            .setDescription(`Ticket status changed to: ${statusEmoji[newStatus]} **${newStatus}**`)
            .setTimestamp();

        await thread.send({ embeds: [embed] });

        // Archive thread if closed
        if (newStatus === 'CLOSED') {
            await thread.setArchived(true);
        }

        return true;

    } catch (err) {
        console.error('Error updating status in Discord:', err);
        return false;
    }
};

// Handle attachment sync
exports.syncAttachment = async (ticketId, fileUrl, fileName, direction = 'web-to-discord') => {
    try {
        if (direction === 'web-to-discord') {
            const { data: mapping } = await supabase
                .from('ticket_discord_mapping')
                .select('discord_thread_id')
                .eq('ticket_id', ticketId)
                .single();

            if (!mapping) return false;

            const thread = await client.channels.fetch(mapping.discord_thread_id);
            if (!thread) return false;

            const embed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('📎 Attachment Uploaded')
                .setDescription(`**${fileName}**\n[View File](${fileUrl})`)
                .setTimestamp();

            await thread.send({ embeds: [embed] });
            return true;
        }

        return false;

    } catch (err) {
        console.error('Error syncing attachment:', err);
        return false;
    }
};
