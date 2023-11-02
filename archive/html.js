const TelegramBot = require('node-telegram-bot-api');
const { debug } = require('./helpers');

const API_KEY_BOT = '6782913082:AAGMSBN2o6V0hEP0bnZJRn2pMvEeseW4KnM';

const bot = new TelegramBot(API_KEY_BOT, {
  polling: {
    interval: 300, // Задержка прихода сообщения с клиента на сервер
    autoStart: true, // Бот был не запущено и ему была отправлена команда -> он её обработает
    params: {
      timeout: 10 // Таймаут между запросами
    }
  }
})

bot.on('message', (msg) => {
  console.log(msg);
 

  bot.sendMessage(msg.chat.id, 'https://core.telegram.org/bots/api#formatting-options', {
    parse_mode: 'HTML',
    protect_content: true
  })
})

// bot.onText(/\/start/, msg => {
//   const { id } = msg.chat;
//   bot.sendMessage(id, debug(msg));
// })

// bot.onText(/\/money (.+)/, (msg, [source, target]) => {
//   const { id } = msg.chat;
//   bot.sendMessage(id, debug(target));
// })