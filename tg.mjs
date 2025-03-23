/**
 * Telegram Login Manager
 * A CLI tool to manage multiple Telegram accounts using StringSession.
 * 
 * Features:
 *  - Add new accounts by logging in with your Telegram credentials.
 *  - List all saved accounts with essential details.
 *  - Delete accounts by their ID from the saved session file.
 * 
 * Usage:
 *  - `node <tg.mjs> add`      # Add a new account
 *  - `node <tg.mjs> list`     # List all saved accounts
 *  - `node <tg.mjs> del <id>` # Delete an account by its ID
 *
 * Developed by: @NabiKAZ (https://twitter.com/NabiKAZ)
 * Channel: https://t.me/BotSorati
 * Project link: https://github.com/NabiKAZ/telegram-login-manager
 */

import * as config from "./config.mjs";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import chalk from 'chalk';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { dirname } from 'dirname-filename-esm';
import input from 'input';
import Table from 'cli-table3';

// Get the current directory of the script for relative paths
const __dirname = dirname(import.meta);

// Configure yargs CLI for command handling
yargs(process.argv.slice(2))
    .usage(chalk.cyanBright('\nTelegram Login Manager by @NabiKAZ (x.com/NabiKAZ)'))
    .usage(chalk.cyan('https://github.com/NabiKAZ/telegram-login-manager\n'))
    .usage('Usage: node $0 <command> [options]')
    .command({
        command: 'list',
        describe: 'List all saved accounts',
        async handler() {
            await listAccounts(); // Calls the function to list accounts
        },
    })
    .command({
        command: 'add',
        describe: 'Add a new Telegram account',
        async handler() {
            await addAccount(); // Calls the function to add a new account
        },
    })
    .command({
        command: 'del <id>',
        describe: 'Delete an account by its ID',
        builder: (yargs) => {
            return yargs.positional('id', {
                describe: 'ID of the account to delete',
                type: 'string',
            });
        },
        async handler(argv) {
            await deleteAccount(argv.id); // Calls the function to delete an account
        },
    })
    .command({
        command: 'messages <id>',
        describe: 'Get last 3 messages',
        builder: (yargs) => {
            return yargs.positional('id', {
                describe: 'ID of the account',
                type: 'string',
            });
        },
        async handler(argv) {
            await lastMessages(argv.id); // Calls the function to get last messages
        },
    })
    .demandCommand(1, 'You must specify a command (add, list, del, messages).') // Require at least one command
    .strict() // Only predefined commands are allowed
    .fail((msg, err, yargs) => {
        if (err) throw err; // Handle internal errors from yargs
        console.log(yargs.help()); // Display help message
        console.log(chalk.redBright(`\nError: ${msg}`));
        process.exit(1); // Exit with error code
    })
    .example([
        ['node $0 list'], // Example of how to use the 'list' command
    ])
    .help()
    .alias('h', 'help')
    .version(false)
    .wrap(55)
    .parse();

/**
 * Retrieve saved accounts from the session file.
 * @returns {Array} List of accounts with their session data.
 */
function getAccounts() {
    const sessionFileName = path.join(__dirname, config.sessionFileName);
    let accounts = [];
    if (fs.existsSync(sessionFileName)) {
        try {
            accounts = fs.readFileSync(sessionFileName, 'utf8');
            accounts = JSON.parse(accounts);
        } catch (error) {
            accounts = [];
        }
    }
    return accounts;
}

/**
 * Retrieve proxy settings (if defined in the config).
 * @returns {Object|null} Proxy configuration or null if no proxy is set.
 */
function getProxy() {
    let objectProxy = null;
    if (config.proxyUrlSocks) {
        objectProxy = {
            ip: config.proxyUrlSocks.split(':')[0],
            port: Number(config.proxyUrlSocks.split(':')[1]),
            socksType: 5,
            timeout: 2,
        };
    }
    return objectProxy;
}

/**
 * Add a new account by logging into Telegram.
 * Saves the session to avoid relogging.
 */
async function addAccount() {
    try {
        const accounts = getAccounts();
        const proxy = getProxy();

        console.log('Connecting to Telegram...');

        // Telegram client configuration
        const stringSession = new StringSession();
        const client = new TelegramClient(stringSession, config.apiId, config.apiHash, {
            connectionRetries: 5,
            proxy: proxy,
        });

        // Set logging level for the client
        client.setLogLevel('ERROR');

        await client.start({
            phoneNumber: async () => await input.text("Please enter your phone number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () => await input.text("Please enter the code you received: "),
            onError: (error) => console.log(chalk.redBright(`Error: ${error.message}`)),
        });

        // Save session to avoid logging in again in the future
        const session = client.session.save();

        // Log success and session info
        console.log('Successfully connected.');
        console.log('Session:', chalk.cyanBright(session));

        const user = await client.getMe();

        // Find the account if it already exists
        let account = accounts.find(account => account.id.toString() === user.id.toString());

        if (account) {
            // If account found, update the session
            account.session = session;
        } else {
            // If account not found, add a new account
            accounts.push({
                id: user.id.toString(),
                session: session,
            });
        }

        // Save the updated accounts list to the session file
        fs.writeFileSync(config.sessionFileName, JSON.stringify(accounts, null, 2), 'utf8');

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        console.log(chalk.greenBright(`User ID: "${user.id.toString()}" (${fullName}) Session saved in the file "${config.sessionFileName}"`));

        client.disconnect();

    } catch (error) {
        console.log(chalk.redBright(`Error: ${error.message}`));
    }
}

/**
 * List all saved Telegram accounts in a table format.
 */
async function listAccounts() {
    const accounts = getAccounts();
    const proxy = getProxy();

    // Check if there are no accounts in the list
    if (accounts.length === 0) {
        console.log(chalk.yellowBright('No accounts found.'));
        return;
    }

    // Define the table headers for displaying account information
    const heads = ['#', 'ID', 'Phone', 'First Name', 'Last Name', 'Username'];

    // Create a new table instance with the defined headers
    const table = new Table({
        head: heads,
    });

    // Use Promise.all to process all accounts concurrently
    process.stdout.write('Loading');
    const promises = await Promise.all(accounts.map(async (account, index) => {
        try {
            // Telegram client configuration for each account
            const stringSession = new StringSession(account.session);
            const client = new TelegramClient(stringSession, config.apiId, config.apiHash, {
                connectionRetries: 5,
                proxy: proxy,
            });

            // Set logging level
            client.setLogLevel('ERROR');

            // Connect to the Telegram client
            await client.start();

            // Change status to online
            await client.invoke(
                new Api.account.UpdateStatus({
                    offline: false,
                })
            );

            const user = await client.getMe();

            const rows = [
                index + 1,
                user.id.toString(),
                '+' + user.phone,
                user.firstName,
                user.lastName,
                user.username,
            ];
            process.stdout.write('.'); // Progress indicator
            client.disconnect();
            return rows;

        } catch (error) {
            return [
                index + 1,
                account?.id ?? '',
                { content: chalk.redBright(`Error: ${error.message}`), colSpan: 4 } // Error handling in the table
            ];
        }
    }));

    // After all accounts are processed, push the results into the table
    for (const promise of promises) {
        table.push(promise);
    }

    // Display the table of accounts
    console.log('');
    console.log(table.toString());
}

/**
 * Delete an account by its ID from the saved session file.
 * @param {string} userId - The ID of the account to delete.
 */
async function deleteAccount(userId) {
    try {
        const accounts = getAccounts();
        const index = accounts.findIndex(account => account.id.toString() === userId.toString());

        if (index !== -1) {
            // If account is found, delete it
            accounts.splice(index, 1);
            fs.writeFileSync(config.sessionFileName, JSON.stringify(accounts, null, 2), 'utf8');
            console.log(chalk.greenBright(`Account with ID "${userId}" deleted.`));
        } else {
            // If account not found
            console.log(chalk.yellowBright(`Account with ID "${userId}" not found.`));
        }
    } catch (error) {
        console.log(chalk.redBright(`Error: ${error.message}`));
    }
}

async function lastMessages(userId) {
    try {
        const accounts = getAccounts();
        const account = accounts.find(account => account.id.toString() === userId.toString());

        // If account not found
        if (!account) {
            console.log(chalk.yellowBright(`Account with ID "${userId}" not found.`));
        }

        // Telegram client configuration for each account
        const stringSession = new StringSession(account.session);
        const client = new TelegramClient(stringSession, config.apiId, config.apiHash, {
            connectionRetries: 5,
            proxy: getProxy()
        });

        // Set logging level
        client.setLogLevel('ERROR');

        // Connect to the Telegram client
        await client.start();

        // Get more dialogs to ensure we have enough after sorting
        const dialogs = await client.getDialogs({
            limit: 50
        });

        // Filter only private chats
        const privateChats = dialogs.filter(dialog => dialog.isUser);

        if (privateChats.length === 0) {
            console.log('No private chats found.');
            await client.disconnect();
            return;
        }

        // Sort dialogs by the date of the last message (newest first)
        privateChats.sort((a, b) => {
            const dateA = a.message ? a.message.date : 0;
            const dateB = b.message ? b.message.date : 0;
            return dateB - dateA;  // Descending order (newest first)
        });

        // Select the chat with the most recent message
        const mostRecentChat = privateChats[0];

        // Get messages
        const messages = await client.getMessages(mostRecentChat.inputEntity, {
            limit: 3
        });

        // Display messages
        console.log('\n=== Last 3 Messages ===');
        messages.reverse().forEach((message, i) => {
            const date = chalk.gray(new Date(message.date * 1000).toLocaleString());
            const sender = message.out ? chalk.cyan('You') : chalk.green(mostRecentChat.title);
            const messageContent = message.message || (message.media ? chalk.yellow('[Media content]') : chalk.red('[Empty message]'));

            console.log(`${i + 1}. [${date}] ${sender}: ${messageContent}`);
            console.log(chalk.gray('━'.repeat(50)));
        });

        // Disconnect
        await client.disconnect();

    } catch (error) {
        console.log(chalk.redBright(`Error: ${error.message}`));
    }
}