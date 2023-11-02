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
  const { id: chatId } = msg.chat;

  let resValue = 'Keyboard';
  switch(msg.text) {
    case 'Выбор 1':
      resValue = "Вы выбрали время🚲"
      break
    case 'Выбор 2':
      resValue = "Вы выбрали деньги💎"
      break
    case 'Выбор 3':
      resValue = "Вы выбрали жизнь🤍"
      bot.sendMessage(chatId, "Закрываю клавиатуру", {
        reply_markup: {
          remove_keyboard: true
        }
      })
      return
    default:
      resValue = "Вы выбрали клавиатуру✅"
  }

  bot.sendMessage(chatId, resValue, {
    reply_markup: {
      keyboard: [
        ['Выбор 1', 'Выбор 2', 'Выбор 3'],
        [{
          text: 'Местоположение',
          request_location: true,
        },
        {
          text: 'Отправить контакт',
          request_contact: true,
        }
        ]
      ],
      one_time_keyboard: true,
    }
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