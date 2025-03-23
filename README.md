# Telegram Login Manager

Telegram Login Manager is a command-line tool designed to manage Telegram login sessions. It allows you to add, list, and delete Telegram accounts, and stores the session data in a file for future use. This tool supports proxy configurations and error handling.

After adding accounts, you can move the session JSON file to another machine or share it with others. The session file contains the login session information, allowing you to use the same accounts without needing to log in again. You can use it with libraries like [gramjs](https://github.com/gram-js/gramjs) (Node.js), [Telethon](https://github.com/LonamiWebs/Telethon) (Python), and others.

Developed by: [@NabiKAZ](https://twitter.com/NabiKAZ) on Twitter

Channel: [@BotSorati](https://t.me/BotSorati) on Telegram

## Features

- **List all accounts**: View a list of all Telegram accounts with their details.
- **Add a new account**: Add a new Telegram account by logging in with your phone number.
- **Delete an account**: Remove an account from the session file by ID.
- **Get last messages**: Get the last 3 messages from the most recent private chat.
- **Session management**: Saves Telegram session data for easy future logins.
- **Proxy support**: Configure SOCKS5 proxy for connections.

![telegram-login-manager-screenshot-list-accounts](https://github.com/user-attachments/assets/31af34ca-5484-4cb6-869d-f821c01bbfe1)

![telegram-login-manager-screenshot-last-messages](https://github.com/user-attachments/assets/c0a65c60-ba50-43bb-9a11-4d7d3cfe8676)

## Installation

To install and use the Telegram Login Manager, follow these steps:

### 1. Install Git

If you don't have Git installed, download and install it from [Git Downloads](https://git-scm.com/downloads).

### 2. Install Node.js

Download and install Node.js from the official website: [Node.js Downloads](https://nodejs.org/). Ensure you download the LTS version.

### 3. Open Command Prompt (CMD)

- On Windows, press `Win + R`, type `cmd`, and hit `Enter`.
- On macOS/Linux, open your terminal.

### 4. Clone the repository

Once Git and Node.js are installed, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/nabikaz/telegram-login-manager.git
cd telegram-login-manager
```

### 5. Install dependencies

Use npm to install the required dependencies:

```bash
npm install
```

## Configuration

The configuration is stored in the `config.mjs` file. You need to modify the following parameters:

- **apiId**: Your Telegram API ID. You can obtain it from [https://my.telegram.org](https://my.telegram.org).
- **apiHash**: Your Telegram API Hash. You can obtain it from [https://my.telegram.org](https://my.telegram.org).
- **proxyUrlSocks**: If you're using a SOCKS5 proxy, specify the proxy URL in the format `IP:PORT`. Example: `'127.0.0.1:10808'`. If no proxy is required, leave it as `null`.
- **sessionFileName**: The file name where the account session data is stored (default is `accounts.json`).

## Usage

The tool supports three main commands:

### 1. List Accounts

To list all the stored Telegram accounts:

```bash
node tg.mjs list
```

This will display a table of all stored accounts with their ID, phone number, first name, last name, and username.

### 2. Add Account

To add a new account, run:

```bash
node tg.mjs add
```

The tool will prompt you to enter your phone number, password, and verification code to log in to Telegram.

### 3. Delete Account

To delete an account by ID:

```bash
node tg.mjs del <id>
```

Replace `<id>` with the ID of the account you want to delete.

### 4. Get Last Messages

To get the last 3 messages from the most recent private chat:

```bash
node tg.mjs messages <id>
```

Replace `<id>` with the ID of the account you want to retrieve messages for. This command will display the last 3 messages from the most recent private chat of the specified account.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Donation

If this project has been useful to you and you'd like to support its development, I would greatly appreciate your contribution! Here are a few ways you can help:

1. **Give a Star**: Show your support by giving a ⭐ at the top of this GitHub repository. It motivates me to keep improving!
2. **Donate**: If you'd like to contribute financially, you can donate to the following addresses:

   - **USDT (TRC20)**: `TEHjxGqu5Y2ExKBWzArBJEmrtzz3mgV5Hb`
   - **TON**: `UQAzK0qhttfz1kte3auTXGqVeRul0SyFaCZORFyV1WmYlZQj`

Your support, whether through a star or a donation, helps me continue working on projects like this. Thank you for being a part of this journey! 🚀
