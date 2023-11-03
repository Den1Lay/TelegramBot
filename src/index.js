const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const {History, User, NodeObj, Decision, UserHistoryObj} = require('./models');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
require('dotenv').config()
const { debug, debugSome } = require('./helpers');


const keyboards = require('./keyboards');
const kb = require('./keyboard_btns');

const log = console.log;
const cLog = pass => log(chalk.blue.bgRed.bold(pass));

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

bot.onText(/\/start/, async message => {
  const {id: chatId} = message.chat
  const text = `Здравствуй, ${message.from.first_name}\nВыберите команду.`;
  bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboards.origin,
      resize_keyboard:true,
    }
  });

  const { from: {first_name, username, language_code} } = message;

  const user = await User.findOne({username}).populate(['histories']);
  if(!user) {
    const newUser = User({
      username,
      first_name,
      chatId,
      language_code,
      currentHistory: 'null',
      histories: [],
    });

    newUser.save()
    .then(() => log(chalk.blue.bgRed.bold('Success save')))
    .catch(er => console.log("Mongo err: ", er));
  } else {
    // develop mode
    for(let i = 0; i < user.histories.length; i++) {
      const workHis = user.histories[i];
      if(''+workHis.history_id === user.currentHistory) {
        await UserHistoryObj.updateOne({_id: workHis._id}, 
          {
            current_pos: ''
          });
        break
      }
    }
    // develop mode end

    user.currentHistory = 'null';
    user.save()
    .catch(er => console.log("Mongo err: ", er));
  }


  // const firstHistory = History({
  //   name: 'Пробничек',
  //   unique_name: 'Пробничек',
  //   language_code: 'RU', 
  //   comment: 'Ничего серьезного, легкие вопросы чтобы развлечься и найти себе новых знакомств с теми людьми, которых Вы ищите'
  // })
  // const historySave = await firstHistory.save();
  // console.log("historySave ", debug(historySave));

  // const fh = await History.findOne({unique_name: 'Пробничек'}).populate(['zero_node'])

  // const zero_node = NodeObj({
  //   historyId: fh._id,
  //   text: 'Как у тебя дела?',
  //   decisions:[]
  // });

  // const zero_node_save = await zero_node.save();
  // log('zero_node_save', debug(zero_node_save));

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
  const initDec = await Decision.find({nextNodeObj: '6544f75b383737d1e8b03369'})


  const id_now = '6544f75b383737d1e8b03369'; // node id от которого расходятся
  const id_next = '6544fc61e5fb3f802cf2f9ae'; // node id к которому сходятся

  // const commentData = [
  //   "Могло было быть и лучше",
  //   "У меня прилив сил и я хочу это с кем то обсудить"
  // ];
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
      historyId: '6544f3939c8f1881fd48aea7',
      text: 'Что ты можешь сказать про свой характер?',
      decisions:decisionAr.map(({_id}) => _id)
    });
    // zero_node.save().then(() => log(chalk.blue.bgRed.bold('COMPLETE SAVE NODE')));
  }).catch(er => {
    console.log('SAVE ERROR', er)
  })



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
  const {id: chatId } = message.chat;

  const username = message.from.username;
  // Контроллер ответов
  const userData = await User.findOne({username}).populate(['histories'])
  if(userData && userData.currentHistory !== 'null') {
    const chooseInd = message.text[0];
    // внесение изменений в UserHistoryObj
    for(let i = 0; i < userData.histories.length; i++) {
      const workHis = userData.histories[i];
      if(''+workHis.history_id === userData.currentHistory) {
      await UserHistoryObj.updateOne({_id: workHis._id}, 
          {
            current_pos: workHis.current_pos+chooseInd
          });
          break
      }
      // show new keyboard
    }
    
    return
  }
  

  // Контроллер страниц
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
  
})

bot.on('callback_query', async query => {
  const {id: chatId} = query.message.chat;

  let user = await User.findOne({username: query.from.username}).populate(['histories']);
  debugger
  
  if(!debugSome(user.histories, ({history_id}) => ''+history_id === query.data)) {
    const uHO = UserHistoryObj({history_id: query.data, current_pos: ''});
    await uHO.save();
    user.histories = [...user.histories, uHO._id]; 
  }

  user.currentHistory = query.data;
  user.chatId = chatId;
  
  user.save()
    .then(() => {
      History.findById(query.data).then(data => {
        
        NodeObj.findById(data.zero_node)
          .populate(['decisions'])
          .then((data) => {
            
            // Формирование первой клавиатуры
            const passMsg = `Чат начался\n${data.text}`;

            const keyboard = [
              data.decisions.map(({comment, index}) => `${index}: ${comment}`)
            ];
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