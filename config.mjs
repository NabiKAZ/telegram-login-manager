// Configuration file for Telegram Login Manager

// Telegram API ID (you can get this from https://my.telegram.org)
export const apiId = 111111; // Replace with your actual API ID

// Telegram API Hash (you can get this from https://my.telegram.org)
export const apiHash = '11111111111111111111111111111111'; // Replace with your actual API Hash

// SOCKS5 Proxy Configuration
// If you are using a SOCKS5 proxy, set the proxy URL here in the format 'IP:PORT'.
// Example: '127.0.0.1:10808' for a local SOCKS5 proxy running on port 10808.
export const proxyUrlSocks = '127.0.0.1:10808'; // Set your proxy URL or leave it as null if not using a proxy

// The name of the file where session data is saved
// This file contains the list of Telegram account sessions for future logins.
export const sessionFileName = 'accounts.json'; // Default filename for storing account sessions
