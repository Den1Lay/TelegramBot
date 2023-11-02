const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config()
const { debug, Kitten } = require('./helpers');


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
  console.log('Success connect')
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY, {
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
    caption: "WTFF, meeeeen?!?!💢💢💢 [Нюта](https://t.me/ScarletMoon0)",
    parse_mode: 'Markdown'
  });
  // bot.sendPhoto(message.chat.id, './gumboll_emoji.jpg');
})

bot.onText(/\/start/, message => {
  const {id: chatId} = message.chat;
  bot.sendDocument(chatId, fs.readFileSync(__dirname+'/C_konspekt.pdf')).then(msgObj => {
    console.log("Success send"+debug(msgObj));
  });

  

})

bot.onText(/\/file/, message => {
  const {id: chatId} = message.chat;
  fs.readFile(__dirname+'/pizdec.xlsx', (err, data) => {
    bot.sendDocument(chatId, data, {
      caption: 'pizdec.xlsx [Нюта](https://t.me/ScarletMoon0)',
      parse_mode: 'Markdown'
    });
  });
})  