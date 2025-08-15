const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const db = new Database('botdata.db');
const userInputState = {};

// === CONFIGURATION ===
const TELEGRAM_TOKEN = '7458993845:AAG9hpKeaSPK8xWQpArMicVvZG_H4-xnXo4'; // Replace with your bot token
const CHAT_ID =1059837588; // Replace with your chat or group ID
const POLL_INTERVAL = 60 * 1000; // 1 minute
const MISSED_BLOCKS_THRESHOLD = 100; // Alert if missed blocks exceed this

// === STATE TRACKING ===
let lastMissedBlocks = {};
let lastJailed = {};
let lastSlashed = {};

// === INIT BOT ===
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Create tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    chat_id TEXT,
    validator_address TEXT,
    PRIMARY KEY (chat_id, validator_address)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS alert_settings (
    chat_id TEXT,
    validator_address TEXT,
    missed_blocks INTEGER,
    PRIMARY KEY (chat_id, validator_address)
  )
`).run();

// Show welcome message with persistent menu
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `👋 Welcome to the Validator Alert Bot!\n\nUse the buttons below to manage your validator subscriptions:`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔔 Subscribe', callback_data: 'subscribe' },
            { text: '❌ Unsubscribe', callback_data: 'unsubscribe' }
          ],
          [
            { text: '📋 List Subscriptions', callback_data: 'list' },
            { text: '⚙️ Set Alert', callback_data: 'set_alert' }
          ],
          [
            { text: '❓ Help', callback_data: 'help' },
            { text: '🏠 Main Menu', callback_data: 'show_menu' }
          ]
        ]
      }
    }
  );
});

// Handle callback queries with persistent menu
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  
  if (query.data === 'show_menu') {
    bot.editMessageText(
      `🚦 *Validator Alert Bot Menu*\n\nChoose an action below:`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔔 Subscribe', callback_data: 'subscribe' },
              { text: '❌ Unsubscribe', callback_data: 'unsubscribe' }
            ],
            [
              { text: '📋 List Subscriptions', callback_data: 'list' },
              { text: '⚙️ Set Alert', callback_data: 'set_alert' }
            ],
            [
              { text: '❓ Help', callback_data: 'help' },
              { text: '🏠 Main Menu', callback_data: 'show_menu' }
            ]
          ]
        }
      }
    );
  } else if (query.data === 'help') {
    bot.editMessageText(
      `*📚 Validator Alert Bot Help*\n\n` +
      `*Available Commands:*\n` +
      `🔔 *Subscribe* — Add a validator to your watchlist\n` +
      `❌ *Unsubscribe* — Remove a validator from your watchlist\n` +
      `📋 *List Subscriptions* — View all your subscribed validators\n` +
      `⚙️ *Set Alert* — Configure custom missed block thresholds\n` +
      `❓ *Help* — Show this help message\n\n` +
      `*Text Commands:*\n` +
      `/start — Show main menu\n` +
      `/subscribe <address> — Subscribe via text\n` +
      `/unsubscribe <address> — Unsubscribe via text\n` +
      `/list — List subscriptions\n` +
      `/help — Show help\n\n` +
      `*Features:*\n` +
      `• Real-time validator monitoring\n` +
      `• Missed block alerts\n` +
      `• Jailed validator notifications\n` +
      `• Slashed validator alerts\n` +
      `• Custom alert thresholds`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
          ]
        }
      }
    );
  } else if (query.data === 'list') {
    const subs = db.prepare('SELECT validator_address FROM subscriptions WHERE chat_id = ?').all(chatId).map(row => row.validator_address);
    if (subs.length > 0) {
      bot.editMessageText(
        `📋 *Your Subscriptions*\n\n` + subs.map((a, i) => `${i + 1}. \`${a}\``).join('\n'),
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
            ]
          }
        }
      );
    } else {
      bot.editMessageText(
        `📋 *Your Subscriptions*\n\nYou have no subscriptions yet.\n\nUse the Subscribe button to add validators to your watchlist.`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔔 Subscribe', callback_data: 'subscribe' },
                { text: '🔙 Back to Menu', callback_data: 'show_menu' }
              ]
            ]
          }
        }
      );
    }
  } else if (query.data === 'subscribe') {
    bot.editMessageText(
      `🔔 *Subscribe to Validator*\n\nPlease enter the validator address you want to subscribe to:\n\n*Example:* \`storyvaloper1abc123...\``,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
          ]
        }
      }
    );
    userInputState[chatId] = 'awaiting_subscribe';
  } else if (query.data === 'unsubscribe') {
    const subs = db.prepare('SELECT validator_address FROM subscriptions WHERE chat_id = ?').all(chatId);
    if (subs.length === 0) {
      bot.editMessageText(
        `❌ *Unsubscribe*\n\nYou have no subscriptions to unsubscribe from.`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
            ]
          }
        }
      );
    } else {
      const buttons = subs.map(sub => [{ text: `❌ ${sub.validator_address.substring(0, 20)}...`, callback_data: `unsub_${sub.validator_address}` }]);
      buttons.push([{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]);
      
      bot.editMessageText(
        `❌ *Unsubscribe from Validator*\n\nSelect a validator to unsubscribe from:`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: buttons
          }
        }
      );
    }
  } else if (query.data === 'set_alert') {
    const subs = db.prepare('SELECT validator_address FROM subscriptions WHERE chat_id = ?').all(chatId);
    if (subs.length === 0) {
      bot.editMessageText(
        `⚙️ *Set Custom Alert*\n\nYou need to subscribe to validators first before setting custom alerts.`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔔 Subscribe', callback_data: 'subscribe' },
                { text: '🔙 Back to Menu', callback_data: 'show_menu' }
              ]
            ]
          }
        }
      );
    } else {
      const buttons = subs.map(sub => [{ text: `⚙️ ${sub.validator_address.substring(0, 20)}...`, callback_data: `alert_${sub.validator_address}` }]);
      buttons.push([{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]);
      
      bot.editMessageText(
        `⚙️ *Set Custom Alert*\n\nSelect a validator to set custom missed block threshold:`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: buttons
          }
        }
      );
    }
  } else if (query.data.startsWith('unsub_')) {
    const address = query.data.replace('unsub_', '');
    db.prepare('DELETE FROM subscriptions WHERE chat_id = ? AND validator_address = ?').run(chatId, address);
    bot.editMessageText(
      `✅ *Unsubscribed Successfully*\n\nRemoved \`${address}\` from your subscriptions.`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
          ]
        }
      }
    );
  } else if (query.data.startsWith('alert_')) {
    const address = query.data.replace('alert_', '');
    userInputState[chatId] = { step: 'awaiting_alert_threshold', validator: address };
    bot.editMessageText(
      `⚙️ *Set Alert for ${address.substring(0, 20)}...*\n\nEnter the number of consecutive missed blocks to trigger an alert:\n\n*Current default:* ${MISSED_BLOCKS_THRESHOLD} blocks`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
          ]
        }
      }
    );
  }
  
  bot.answerCallbackQuery(query.id);
});

// Handle user text input for subscribe/unsubscribe with persistent menu
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const state = userInputState[chatId];
  
  if (state === 'awaiting_subscribe') {
    const address = msg.text.trim();
    db.prepare('INSERT OR IGNORE INTO subscriptions (chat_id, validator_address) VALUES (?, ?)').run(chatId, address);

    // Fetch validator details from Storyscan API
    try {
      const apiUrl = `https://api-aeneid.storyscan.app/validators/${address}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Validator not found');
      const v = await res.json();

      const details =
        `*Validator Details:*
` +
        `*Name:* ${v.description?.moniker || 'N/A'}
` +
        `*Status:* ${v.status || 'N/A'}
` +
        `*Stake:* ${v.tokens ? (v.tokens / 1_000_000_000).toLocaleString() : 'N/A'}
` +
        `*Commission:* ${v.commission?.commissionRates?.rate ? (parseFloat(v.commission.commissionRates.rate) * 100).toFixed(2) + '%' : 'N/A'}
` +
        `*Address:* \`${address}\``;

      await bot.sendMessage(chatId, 
        `✅ *Successfully Subscribed!*\n\n*Validator:* \`${address}\`\n\n${details}`, 
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📋 List Subscriptions', callback_data: 'list' },
                { text: '🏠 Main Menu', callback_data: 'show_menu' }
              ]
            ]
          }
        }
      );
    } catch (e) {
      await bot.sendMessage(chatId, 
        `✅ *Successfully Subscribed!*\n\n*Validator:* \`${address}\`\n\n⚠️ Could not fetch validator details.`, 
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📋 List Subscriptions', callback_data: 'list' },
                { text: '🏠 Main Menu', callback_data: 'show_menu' }
              ]
            ]
          }
        }
      );
    }

    userInputState[chatId] = undefined;
  } else if (state === 'awaiting_unsubscribe') {
    const address = msg.text.trim();
    db.prepare('DELETE FROM subscriptions WHERE chat_id = ? AND validator_address = ?').run(chatId, address);
    bot.sendMessage(chatId, 
      `❌ *Unsubscribed Successfully*\n\nRemoved \`${address}\` from your subscriptions.`, 
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 List Subscriptions', callback_data: 'list' },
              { text: '🏠 Main Menu', callback_data: 'show_menu' }
            ]
          ]
        }
      }
    );
    userInputState[chatId] = undefined;
  } else if (state === 'awaiting_alert_validator') {
    userInputState[chatId] = { step: 'awaiting_alert_threshold', validator: msg.text.trim() };
    bot.sendMessage(chatId, 
      'Enter the number of consecutive missed blocks to trigger an alert:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
          ]
        }
      }
    );
  } else if (state && typeof state === 'object' && state.step === 'awaiting_alert_threshold') {
    const validator = state.validator;
    const threshold = parseInt(msg.text.trim());
    if (isNaN(threshold) || threshold < 1) {
      bot.sendMessage(chatId, 
        '❌ Invalid number. Please enter a valid number greater than 0.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
            ]
          }
        }
      );
      return;
    }
    db.prepare('INSERT OR REPLACE INTO alert_settings (chat_id, validator_address, missed_blocks) VALUES (?, ?, ?)').run(chatId, validator, threshold);
    bot.sendMessage(chatId, 
      `⚙️ *Custom Alert Set Successfully*\n\n*Validator:* \`${validator}\`\n*Threshold:* ${threshold} consecutive missed blocks\n\nYou will now receive alerts when this validator misses more than ${threshold} blocks in a row.`, 
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 List Subscriptions', callback_data: 'list' },
              { text: '🏠 Main Menu', callback_data: 'show_menu' }
            ]
          ]
        }
      }
    );
    userInputState[chatId] = undefined;
  } else if (msg.text && msg.text.startsWith('/')) {
    // Handle text commands
    const command = msg.text.split(' ')[0];
    if (command === '/start') {
      bot.sendMessage(chatId,
        `👋 Welcome to the Validator Alert Bot!\n\nUse the buttons below to manage your validator subscriptions:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔔 Subscribe', callback_data: 'subscribe' },
                { text: '❌ Unsubscribe', callback_data: 'unsubscribe' }
              ],
              [
                { text: '📋 List Subscriptions', callback_data: 'list' },
                { text: '⚙️ Set Alert', callback_data: 'set_alert' }
              ],
              [
                { text: '❓ Help', callback_data: 'help' },
                { text: '🏠 Main Menu', callback_data: 'show_menu' }
              ]
            ]
          }
        }
      );
    } else if (command === '/help') {
      bot.sendMessage(chatId,
        `*📚 Validator Alert Bot Help*\n\n` +
        `*Available Commands:*\n` +
        `🔔 *Subscribe* — Add a validator to your watchlist\n` +
        `❌ *Unsubscribe* — Remove a validator from your watchlist\n` +
        `📋 *List Subscriptions* — View all your subscribed validators\n` +
        `⚙️ *Set Alert* — Configure custom missed block thresholds\n` +
        `❓ *Help* — Show this help message\n\n` +
        `*Text Commands:*\n` +
        `/start — Show main menu\n` +
        `/subscribe <address> — Subscribe via text\n` +
        `/unsubscribe <address> — Unsubscribe via text\n` +
        `/list — List subscriptions\n` +
        `/help — Show help\n\n` +
        `*Features:*\n` +
        `• Real-time validator monitoring\n` +
        `• Missed block alerts\n` +
        `• Jailed validator notifications\n` +
        `• Slashed validator alerts\n` +
        `• Custom alert thresholds`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'show_menu' }]
            ]
          }
        }
      );
    } else if (command === '/list') {
      const subs = db.prepare('SELECT validator_address FROM subscriptions WHERE chat_id = ?').all(chatId).map(row => row.validator_address);
      if (subs.length > 0) {
        bot.sendMessage(chatId, 
          `📋 *Your Subscriptions*\n\n` + subs.map((a, i) => `${i + 1}. \`${a}\``).join('\n'),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🏠 Main Menu', callback_data: 'show_menu' }]
              ]
            }
          }
        );
      } else {
        bot.sendMessage(chatId, 
          `📋 *Your Subscriptions*\n\nYou have no subscriptions yet.\n\nUse the Subscribe button to add validators to your watchlist.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔔 Subscribe', callback_data: 'subscribe' },
                  { text: '🏠 Main Menu', callback_data: 'show_menu' }
                ]
              ]
            }
          }
        );
      }
    }
  }
});

async function checkValidators() {
  try {
    const url = 'https://api-story-testnet.itrocket.net/cosmos/slashing/v1beta1/signing_infos?pagination.limit=200';
    const res = await fetch(url);
    const data = await res.json();

    for (const info of data.info) {
      const address = info.address;
      const missed = parseInt(info.missed_blocks_counter || '0');
      const jailed = info.jailed_until && info.jailed_until !== '0001-01-01T00:00:00Z';
      const slashed = info.tombstoned;

      // For each user, check if they are subscribed to this validator
      const subs = db.prepare('SELECT chat_id FROM subscriptions WHERE validator_address = ?').all(address).map(row => row.chat_id);
      for (const chatId of subs) {
        // Use custom threshold if set, else default
        const row = db.prepare('SELECT missed_blocks FROM alert_settings WHERE chat_id = ? AND validator_address = ?').get(chatId, address);
        const threshold = row ? row.missed_blocks : MISSED_BLOCKS_THRESHOLD;

        if (missed > threshold && lastMissedBlocks[address] !== missed) {
          await bot.sendMessage(
            chatId,
            `⚠️ *Validator* \`${address}\` *missed* ${missed} blocks! (Threshold: ${threshold})`,
            { parse_mode: 'Markdown' }
          );
          lastMissedBlocks[address] = missed;
        }

        // Jailed alert
        if (jailed && !lastJailed[address]) {
          await bot.sendMessage(
            chatId,
            `🚨 *Validator* \`${address}\` *has been jailed!*`,
            { parse_mode: 'Markdown' }
          );
          lastJailed[address] = true;
        }
        if (!jailed && lastJailed[address]) {
          await bot.sendMessage(
            chatId,
            `✅ *Validator* \`${address}\` *is no longer jailed.*`,
            { parse_mode: 'Markdown' }
          );
          lastJailed[address] = false;
        }

        // Slashed alert
        if (slashed && !lastSlashed[address]) {
          await bot.sendMessage(
            chatId,
            `❌ *Validator* \`${address}\` *has been slashed!*`,
            { parse_mode: 'Markdown' }
          );
          lastSlashed[address] = true;
        }
      }
    }
  } catch (err) {
    console.error('Error checking validators:', err);
  }
}

// === MAIN LOOP ===
console.log('Starting validator alert bot with menu...');
checkValidators(); // Run once at start
setInterval(checkValidators, POLL_INTERVAL);
