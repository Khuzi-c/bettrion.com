const { Events } = require('discord.js');
const ticketSync = require('../../controllers/ticketSyncController');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Check if message is in a ticket thread
        if (!message.channel.isThread()) return;

        // Check if thread is a support ticket
        const threadId = message.channel.id;

        try {
            // Sync Discord message to web
            await ticketSync.syncDiscordToWeb(threadId, message);

            // React to confirm sync
            await message.react('✅');
        } catch (err) {
            console.error('Error syncing Discord message to web:', err);
            await message.react('❌');
        }
    },
};
