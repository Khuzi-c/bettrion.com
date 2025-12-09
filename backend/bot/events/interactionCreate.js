const { Events } = require('discord.js');
const ticketSync = require('../../controllers/ticketSyncController');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }

        // Handle button interactions
        else if (interaction.isButton()) {
            const [action, subAction, ticketId] = interaction.customId.split('_');

            if (action === 'ticket') {
                try {
                    if (subAction === 'assign') {
                        // Assign ticket to user
                        await interaction.reply({ content: `✅ Ticket assigned to <@${interaction.user.id}>`, ephemeral: false });

                        // Update in database
                        await supabase
                            .from('tickets')
                            .update({
                                status: 'IN_PROGRESS',
                                assigned_to: interaction.user.id
                            })
                            .eq('id', ticketId);

                        // Sync status update
                        await ticketSync.updateTicketStatus(ticketId, 'IN_PROGRESS');

                    } else if (subAction === 'close') {
                        // Close ticket
                        await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: false });

                        // Update in database
                        await supabase
                            .from('tickets')
                            .update({ status: 'CLOSED' })
                            .eq('id', ticketId);

                        // Sync status update
                        await ticketSync.updateTicketStatus(ticketId, 'CLOSED');

                        // Archive thread
                        await interaction.channel.setArchived(true);

                    } else if (subAction === 'priority') {
                        // Show priority selection
                        await interaction.reply({
                            content: 'Priority levels:\n🔴 HIGH\n🟡 MEDIUM\n🟢 LOW\n\nUse `/admin ticket priority <id> <level>` to change',
                            ephemeral: true
                        });
                    }
                } catch (err) {
                    console.error('Error handling ticket button:', err);
                    await interaction.reply({ content: '❌ Error processing action', ephemeral: true });
                }
            }
        }
    },
};
