'use strict';

require('dotenv').config(); // process.env.*
require('manakin').global; // colors for Console.*

//---------------------------------------------------------------------------------------------------------------//

const Discord = require('discord.js');
const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;

//---------------------------------------------------------------------------------------------------------------//

/**
 * Asynchronous setTimeout b/c I'm too lazy to type it out everywhere
 * @param {Number} time_in_milliseconds 
 * @returns {Promise} 
 */
function Timer(time_in_milliseconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, time_in_milliseconds));
}

/**
 * Parses message_content for the command used
 * @param {String} message_content 
 * @returns {String} the `discord_command` including the `command_prefix`
 */
function getDiscordCommand(message_content) {
    if (typeof message_content !== 'string') throw new TypeError('`message_content` must be a valid string!');
    return message_content.split(/\s/g).filter(item => item !== '')[0].toLowerCase();
}

/**
 * Gets an array of command arguments based off of separating the message_content with spaces
 * @param {String} message_content 
 * @returns {Array<String>} the `command_args` of the command message
 */
function getDiscordCommandArgs(message_content) {
    if (typeof message_content !== 'string') throw new TypeError('`message_content` must be a valid string!');
    return message_content.split(/\s/g).filter(item => item !== '').slice(1);
}

//---------------------------------------------------------------------------------------------------------------//

let mc_bot;
let mc_bot_is_ready = false;
function start_mc_bot() {
    if (mc_bot_is_ready) return;

    mc_bot = mineflayer.createBot({
        host: process.env.MC_SERVER_IP,
        port: process.env.MC_SERVER_PORT,
        username: process.env.MC_ACCOUNT_EMAIL,
        password: process.env.MC_ACCOUNT_PASSWORD,
        version: process.env.MC_GAME_VERSION, // optional; set to `false` for auto version
        auth: process.env.MC_API_AUTH, // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
    });

    // message events:
    mc_bot.on('message', (json_message, position) => {
        const json_message_text = json_message.text.replace(/\§([\w|\d]?)/gi, '');
        const json_message_extra = json_message.extra;
        const combined_json_message_extra = json_message_extra?.map(chat_message => chat_message.text.trim())?.join(' ') ?? '';

        console.log('---------------------------------------------------------------------------------------------------------------');
        console.log({ json_message, json_message_text, json_message_extra, combined_json_message_extra, position });
        console.log('---------------------------------------------------------------------------------------------------------------');

        const discord_bot_chat_log_channel = discord_bot.channels.cache.get(process.env.DISCORD_BOT_CHAT_LOG_CHANNEL_ID);
        discord_bot_chat_log_channel?.send(`${json_message_text} ${combined_json_message_extra}`)?.catch(console.warn);
    });

    // log errors and kick reasons:
    mc_bot.on('kicked', (reason, loggedIn) => console.warn(reason, loggedIn));
    mc_bot.on('error', (err) => console.trace(err));

    mc_bot.once('spawn', async () => {
        /* start live view to watch bot's camera */
        // mineflayerViewer(mc_bot, { port: 24003, firstPerson: true });

        await Timer(1250); // 1.25 seconds

        console.info('---------------------------------------------------------------------------------------------------------------');
        console.info('Minecraft Bot Is Ready!');
        console.info('---------------------------------------------------------------------------------------------------------------');

        mc_bot_is_ready = true;
    });
}

//---------------------------------------------------------------------------------------------------------------//

const discord_bot_controllers = process.env.DISCORD_BOT_CONTROLLERS.split(',').map(item => item.trim());

const discord_bot_command_prefix = `${process.env.DISCORD_BOT_COMMAND_PREFIX}`;
const discord_bot = new Discord.Client({
    presence: {
        status: 'online',
        type: 4,
        activity: {
            type: 'PLAYING',
            name: `${discord_bot_command_prefix}help`,
        },
    },
    messageCacheMaxSize: 50, // keep 50 messages cached in each channel
    messageCacheLifetime: 60 * 5, // messages should be kept for 5 minutes
    messageSweepInterval: 60 * 5, // sweep messages every 5 minutes
});

discord_bot.on('ready', () => {
    console.info('---------------------------------------------------------------------------------------------------------------');
    console.info('Discord Bot Logged In!');
    console.info('---------------------------------------------------------------------------------------------------------------');
});

discord_bot.on('message', async (message) => {
    if (message.author.bot) return; // don't allow bots
    
    if (message.content.startsWith(discord_bot_command_prefix)) {
        if (!discord_bot_controllers.includes(message.author.id)) {
            message.reply('You aren\'t allowed to use me!');
            return;
        }

        const discord_command = getDiscordCommand(message.content);
        const command_args = getDiscordCommandArgs(message.content);

        switch (discord_command) {
            case `${discord_bot_command_prefix}help`:
                message.channel.send('Available Commands: \`help\`, \`start\`, \`stop\`, \`join\`, \`tpyes\`, \`chat\`');
                break;
            case `${discord_bot_command_prefix}start`:
                if (mc_bot_is_ready) {
                    message.reply('The Mincraft bot has already started!');
                } else {
                    message.reply('Starting the Mincraft bot!');
                    start_mc_bot();
                }
                break;
            case `${discord_bot_command_prefix}stop`:
                /* reply in discord */
                await message.reply(`I am going to stop everything now!\nWait a few seconds then do \`${discord_bot_command_prefix}start\` to start me!`);

                await Timer(1000);

                /* restart bot */
                process.exit(0);
            case `${discord_bot_command_prefix}join`:
                if (!mc_bot_is_ready) {
                    message.reply(`The Mincraft bot needs to be started!\nDo \`${discord_bot_command_prefix}start\` to start it!`);
                    return;
                }

                /* send command to minecraft */
                mc_bot.chat(`${process.env.MC_JOIN_COMMAND}`);

                /* reply in discord */
                message.reply('I sent the command to the game!');
                break;
            case `${discord_bot_command_prefix}tpyes`:
                if (!mc_bot_is_ready) {
                    message.reply(`The Mincraft bot needs to be started!\nDo \`${discord_bot_command_prefix}start\` to start it!`);
                    return;
                }

                /* send command to minecraft */
                mc_bot.chat('/tpyes');

                /* reply in discord */
                message.reply('I sent the command to the game!');
                break;
            case `${discord_bot_command_prefix}chat`:
                if (!mc_bot_is_ready) {
                    message.reply(`The Mincraft bot needs to be started!\nDo \`${discord_bot_command_prefix}start\` to start it!`);
                    return;
                }

                const message_to_send_to_mc = command_args.join(' ').trim();
                if (message_to_send_to_mc.length > 0) {
                    /* send message to minecraft */
                    mc_bot.chat(`${message_to_send_to_mc}`);

                    /* reply in discord */
                    message.reply('I sent the message to the game!');
                } else {
                    message.reply('Try sending something after the command next time!');
                }
                break;
            default:
                /* reply in discord */
                message.reply(`That isn\'t a valid command!\nSend \`${discord_bot_command_prefix}help\` for help!`);
                break;
        }
    }
});

discord_bot.login(process.env.DISCORD_BOT_TOKEN);

//---------------------------------------------------------------------------------------------------------------//

/* prevent the bot from crashing for unhandledRejections */
process.on('unhandledRejection', (reason, promise) => {
    console.error('----------------------------------------------------------------------------------------------------------------');
    console.trace('unhandledRejection at:', reason?.stack ?? reason, promise);
    console.error('----------------------------------------------------------------------------------------------------------------');
});

/* prevent the bot from crashing for uncaughtExceptions */
process.on('uncaughtException', (error) => {
    console.error('----------------------------------------------------------------------------------------------------------------');
    console.trace('uncaughtException at:', error);
    console.error('----------------------------------------------------------------------------------------------------------------');
});