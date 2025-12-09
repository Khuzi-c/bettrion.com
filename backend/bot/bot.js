const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Initialize commands collection
client.commands = new Collection();

// Track bot ready state
let botReady = false;

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Loaded command: ${command.data.name}`);
        }
    }
}

// Load event handlers
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ Loaded event: ${event.name}`);
    }
}

client.once('ready', () => {
    botReady = true;
    console.log(`Bot is Ready: ${client.user.tag}`);

    // Set initial status
    client.user.setPresence({
        status: 'dnd',
        activities: [{
            name: 'bettrion.com',
            type: 3 // Watching
        }]
    });

    // Rotating status messages
    const statuses = [
        { name: 'bettrion.com', type: 3 }, // Watching
        { name: 'discord.gg/bettrion', type: 0 }, // Playing
        { name: '🎰 Casino Reviews', type: 3 }, // Watching
        { name: '💬 Support Tickets', type: 3 }, // Watching
        { name: '🎲 Best Casinos', type: 2 }, // Listening
        { name: '⭐ Top Rated Games', type: 3 }, // Watching
        { name: '🔥 New Bonuses', type: 3 }, // Watching
        { name: '💎 VIP Rewards', type: 3 }, // Watching
        { name: '🎁 Daily Offers', type: 3 }, // Watching
        { name: '📊 Live Stats', type: 3 } // Watching
    ];

    let currentIndex = 0;

    // Change status every 10 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % statuses.length;
        client.user.setPresence({
            status: 'dnd',
            activities: [statuses[currentIndex]]
        });
    }, 10000); // 10 seconds
});

// Helper to check if bot is ready
client.isBotReady = () => botReady;

if (process.env.DISCORD_BOT_TOKEN) {
    client.login(process.env.DISCORD_BOT_TOKEN).catch(e => console.error("Bot Login Failed:", e));
}

module.exports = { client };
