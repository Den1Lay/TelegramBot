const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs')
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



bot.onText(/\/money/, message => {
  bot.sendPhoto(message.chat.id, fs.readFileSync(__dirname+'/gumboll_emoji.jpg'), {
    caption: "WTFF, meeeeen?!?!💢💢💢"
  });
  // bot.sendPhoto(message.chat.id, './gumboll_emoji.jpg');
})