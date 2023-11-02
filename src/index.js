const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
require('dotenv').config()
const { debug } = require('./helpers');

const {History, User, NodeObj, Decision} = require('./models')
const keyboards = require('./keyboards');
const kb = require('./keyboard_btns');

const log = console.log;

main().catch(err => console.log(err));

// ================================================================

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  if(mongoose.connection) {
    console.log('Success connect')
  }
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// const testHistory = History({
//   name: "Пробничек",
//   unique_name: "Пробничек001",
//   language_code: "ru",
//   comment: "Здесь собраны рандомные вопросы, не воспринимайте все в серьёз 😅",
// });

// testHistory.save().then(data => {
//   log(chalk.blue.bgRed.bold('Success save'))
// })



// Vendor.deleteMany().then(() => {
//   // console.log("DeleteMany");
//   console.log("start working with json");
//   const file = path.join(__dirname, '..', 'mac-vendors-export.json');
//   fs.readFile(file, (err, data) => {
//     // console.log(JSON.parse(data));
//     const dataObj = JSON.parse(data);
    
//     const saveAll = i => {
//       if(i < dataObj.length) {
//         const vendor = new Vendor(dataObj[i]);
//         vendor.save().then(() => {
//           saveAll(i+1);
//         });

//       }
//     }
//     saveAll(0);
    
//     console.log('success save');
//   })
// })

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
    caption: "Нет такого... 🎃👑♠💢 ",  
    parse_mode: 'Markdown'
  });
  // bot.sendPhoto(message.chat.id, './gumboll_emoji.jpg');
})

bot.onText(/\/start/, message => {
  const {id: chatId} = message.chat
  const text = `Здравствуй, ${message.from.first_name}\nВыберите команду.`;
  bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboards.origin,
      resize_keyboard:true,
    }
  });

  // Процесс идентификации
  User.find().then(data => {
    // console.log("Users.find(): ", debug(data));
    const { from: {first_name, username, language_code} } = message;
    if(!data.some(({username: mongoUsername}) => mongoUsername === username)) {
      const newUser = User({
        username,
        first_name,
        language_code,
        currentHistory: 'null',
        histories: [],
      });
      newUser.save().then(() => log(chalk.blue.bgRed.bold('Success save')));
    }

  })
  .catch(er => console.log("Mongo err: ", er));

  console.log(debug(message));
  // jsonfile.readFile(file)
  // .then(obj => console.dir(obj))
  // .catch(error => console.error(error))


  // const zero_node = NodeObj({
  //   historyId: '6541276de41a1b250a61b756',
  //   text: 'Как у тебя в принципе дела?',
  //   decisions:[]
  // });

  // zero_node.save().then(data => {
  //   log(chalk.blue.bgRed.bold('Success save'))
  // })

  // const zero_node_id = '6541299d9c3d5abf96bd239d';

  // History.updateOne({'_id': '6541276de41a1b250a61b756'}, {zero_node: zero_node_id})
  //   .then(() => log(chalk.blue.bgRed.bold('Success update')));

  // const newDecision = Decision(
  //   {
  //     comment: 'У меня прилив сил и я хочу это с кем то обсудить',
  //     index: 1,
  //   }
  // )
  // newDecision.save().then(() => log(chalk.blue.bgRed.bold('Success save')));

  // const d1 = '65412d3eb223a4dc3182855e';
  // const d2 = '65412d5c7919474e1d0dde43';
  // NodeObj.updateOne({'_id': '6541299d9c3d5abf96bd239d'}, {decisions: [d1, d2]})
  //   .then(() => log(chalk.blue.bgRed.bold('Success update')));

  let i = 0;
  const id_now = '65412f7f34aed7ef4ed6eefa';
  const id_next = '6541302d15f3e207f16b112d';

  const commentData = [
    'Я гадость', 
    'Я река', 
    'Я бомба, которая взорвется от неправильного слова',
    'Я нормис, хожу на спортик, на позитиве, осуждаю пары',
    'Люблю просто так кричать на улице)))'
  ]
  const decisionAr = commentData.map((el, i) => {
    return Decision(
      {
        comment: el,
        index: i,
        nextNodeObj: id_next,
      }
    )
  });
  
  const decisionSave =  new Promise((resolve, reject) => {
    const saveAll = (arr, i) => {
      if(i < arr.length) {
        arr[i].save().then(() => {
          saveAll(arr, i+1);
        }).catch(er => reject(er));
      } else {
        resolve()
      }
    }
    // saveAll(decisionAr, 0);
  }).then(() => {
    // save nodeObj
    const zero_node = NodeObj({
      _id: id_now,
      historyId: '6541276de41a1b250a61b756',
      text: 'Что ты можешь сказать про свой характер?',
      decisions:decisionAr.map(({_id}) => _id)
    });
    // zero_node.save().then(() => log(chalk.blue.bgRed.bold('COMPLETE SAVE NODE', i)));
  }).catch(er => {
    console.log('SAVE ERROR', er)
  })

  
  log("decisionAr ", decisionAr);
  log("decisionAr_id ", decisionAr.map(({_id}) => _id));

 
  // a5.save().then(() => {log(chalk.blue.bgRed.bold('Success save', i)); i++});

})

bot.onText(/\/show/, message => {
  console.log('show')
  const {id: chatId} = message.chat;
  History.find().populate(['zero_node']).then(data => {
    console.log(' History.find().populate([zero_node]) ', data);
  })
  .catch(er => log("Error: ", er));

  bot.sendMessage(chatId, ''+(new mongoose.Types.ObjectId()), {
    reply_markup: {
      keyboard: keyboards.origin,
      resize_keyboard:true,
    }
  })
});

bot.onText(/\/file/, message => {
  const {id: chatId} = message.chat;
  
});

bot.on('message', async (message) => {
  const {id: chatId} = message.chat;


  

  // const silence = new Kitten({ name: message.text });
  // // silence.speak();
  // console.log(debug(message));
  // await silence.save();

  // page controller
  
  switch(message.text) {
    case kb.back:
      bot.sendMessage(chatId, 'Начальное меню', {
        reply_markup: {
          keyboard: keyboards.origin,
          resize_keyboard:true,
        }
      })
      break
    case kb.origin.info:
      bot.sendMessage(chatId, 'Просто жми кнопку "К ТЕСТАМ"', {
        reply_markup: {
          keyboard: keyboards.origin,
          resize_keyboard:true,
        }
      })
      break
    case kb.origin.toTests:
      History.find().populate(['zero_node']).then(data => {
        const { _id, name, comment, zero_node } = data[0];
        const resText = `${name}\n${comment}`

        console.log('History.find().populate([zero_node])', debug(data[0]));
        bot.sendMessage(chatId, resText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Перейти',
                  callback_data: _id,
                }
              ],
            ]
          }
        });
      });
      break
  }

  // // request controller
  // switch(message.text) {
  //   case keyboards.origin.all:
  //     // Запрос
  //     // Отправка фиксированного числа сообщений
  //     break
  //   case keyboards.private.on:
  //       console.log()
  //     break
  // }
})

bot.on('callback_query', query => {
  const {id: chatId} = query.message.chat;
  // bot.sendMessage(query.message.chat.id, debug(query));
  log("callback_query", debug(query));
  User.updateOne({username: query.from.username}, {currentHistory: query.data})
    .then(() => {
      History.findById(query.data).then(data => {
        
        NodeObj.findById(data.zero_node)
          .populate(['decisions'])
          .then((data) => {
            console.log("NodeObj.findById(data.zero_node)", debug(data));
            
            // Формирование первой клавиатуры
            const passMsg = `Чат начался\n${data.text}`;

            const keyboard = [data.decisions.map(({comment}) => comment)];
            bot.sendMessage(chatId, passMsg, {
              reply_markup: {
                keyboard,
                resize_keyboard:true,
              }
            });
          })
        
      })

      
    })
  // bot.answerCallbackQuery(query.id, `${query.data}`);
  // bot.sendMessage(query.message.chat.id, debug(query));
})