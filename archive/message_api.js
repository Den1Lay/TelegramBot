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

const inline_keyboard = [
  [
    {
      text: 'Forward',
      callback_data: 'forward'
    },
    {
      text: 'Reply',
      callback_data: 'reply'
    }     
  ], 
  [
    {
      text: 'Edit',
      callback_data: 'edit'
    },
    {
      text: 'Delete',
      callback_data: 'delete'
    }     
  ]
]

bot.onText(/\/start/, (message, [source, match]) => {
    const chatId = message.chat.id;

    bot.sendMessage(chatId, 'Keyboard', {
      reply_markup: {
        inline_keyboard
      }
    })
})

bot.on('callback_query', query => {
  const { chat ,message_id, text } = query.message

  switch (query.data) {
    case 'forward':
      bot.forwardMessage(chat.id, chat.id, message_id)
      break
    case 'reply':
      bot.sendMessage(chat.id, 'Reply to message', {
        reply_to_message_id: message_id,
      })
      break
    case 'edit':
      bot.editMessageText(`${text}_edited`, {
        chat_id: chat.id,
        message_id: message_id,
        reply_markup: { inline_keyboard }
      })
      break
    case 'delete':
      bot.deleteMessage(chat.id, message_id);
      break
  }

  bot.answerCallbackQuery(query.id,
  {
    text: query.data, 
    // show_alert: true,
  });
})