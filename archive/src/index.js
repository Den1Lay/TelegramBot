const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile')
require('dotenv').config()
const { debug, Kitten } = require('./helpers');
const Vendor = require('./models/vendor_model');
const keyboards = require('./keyboards');
const kb = require('./keyboard_btns');

main().catch(err => console.log(err));

// ================================================================

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  if(mongoose.connection) {
    console.log('Success connect')
  }
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

Vendor.deleteMany().then(() => {
  // console.log("DeleteMany");
  console.log("start working with json");
  const file = path.join(__dirname, '..', 'mac-vendors-export.json');
  fs.readFile(file, (err, data) => {
    // console.log(JSON.parse(data));
    const dataObj = JSON.parse(data);
    
    const saveAll = i => {
      if(i < dataObj.length) {
        const vendor = new Vendor(dataObj[i]);
        vendor.save().then(() => {
          saveAll(i+1);
        });

      }
    }
    saveAll(0);
    
    console.log('success save');
  })
})

// ================================================================

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
  bot.sendPhoto(message.chat.id, fs.readFileSync(__dirname+'/cute.jpg'), {
    caption: "MOST CUTTED [MASHPIT](https://t.me/ksksksks2) 🍓 AND MOST AGRESSIVE [DENILAY](https://t.me/Den1Lay) 💢 ",  
    parse_mode: 'Markdown'
  });
  // bot.sendPhoto(message.chat.id, './gumboll_emoji.jpg');
})

bot.onText(/\/start/, message => {
  const {id: chatId} = message.chat
  const text = `Здравствуй, ${message.from.first_name}\nВыберите команду.`;
  bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboards.origin
    }
  });

  // jsonfile.readFile(file)
  // .then(obj => console.dir(obj))
  // .catch(error => console.error(error))

})

bot.onText(/\/file/, message => {
  const {id: chatId} = message.chat;
  
});

bot.on('message', async (message) => {
  const {id: chatId} = message.chat;
  const silence = new Kitten({ name: message.text });
  // silence.speak();
  console.log(debug(message));
  await silence.save();

  // page controller
  switch(message.text) {
    case kb.back:
      bot.sendMessage(chatId, 'Начальное меню', {
        reply_markup: {
          keyboard: keyboards.origin
        }
      })
      break
    case kb.origin.all:
      bot.sendMessage(chatId, 'Вcе элементы )))', {
        reply_markup: {
          keyboard: keyboards.all
        }
      })
      break
    case kb.origin.private:
      bot.sendMessage(chatId, 'Выберите тип привата:', {
        reply_markup: {
          keyboard: keyboards.private
        }
      })
      break
    case kb.origin.blockType:
      bot.sendMessage(chatId, 'Выберите тип блока:', {
        reply_markup: {
          keyboard: keyboards.blockType
        }
      })
      break
  }

  // request controller
  switch(message.text) {
    case keyboards.origin.all:
      // Запрос
      // Отправка фиксированного числа сообщений
      break
    case keyboards.private.on:
        console.log()
      break
  }
})