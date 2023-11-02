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

const results = [
  {
    type: 'photo',
    id: ''+1, //Math.random() * 100 % 64, 
    photo_url: 'https://i.pinimg.com/564x/5e/19/eb/5e19ebe9ae7c234f7fa23e7b99de8cab.jpg',
    thumbnail_url: 'https://i.pinimg.com/564x/5e/19/eb/5e19ebe9ae7c234f7fa23e7b99de8cab.jpg',
    title: "Gumboll",
  }, 
  // {
  //   type: 'article',
  //   id: '22',
  //   title: "Title 22",
  //   input_message_content: {
  //     message_text: 'Article №22'
  //   }
  // }
];

bot.on('inline_query', query => {
  console.log('inline_query');
  bot.answerInlineQuery(query.id, results, {
    cache_time: 0
  })
})
