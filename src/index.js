const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const {History, User, NodeObj, Decision, UserHistoryObj, Room, MyRoom} = require('./models');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
require('dotenv').config()
const { 
  debug, 
  debugSome, 
  findAndReturn,
  checkMessageRouter,
  prepareKeyboard,
  endPointHandler,
  prepareEndPointStr
} = require('./helpers');


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
  if(!message.from.hasOwnProperty('username')) {
    bot.sendMessage(chatId, "Настройте username в настройках Telegram");
    return
  }

  const { from: {first_name, username, language_code} } = message;
  debugger
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
    const workHis = findAndReturn(user.histories, 'history_id', user.currentHistory);
    await UserHistoryObj.updateOne({_id: workHis._id}, 
      {
        current_pos: ''
      });
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
})

bot.onText(/\/dev/, async message => {
  if(message.from.username !== 'Den1Lay') return;
  console.log('show')
  const {id: chatId} = message.chat;
  History.find().populate(['zero_node']).then(data => {
    console.log(' History.find().populate([zero_node]) ', data);
  })
  .catch(er => log("Error: ", er));

  await bot.sendMessage(chatId, ''+(new mongoose.Types.ObjectId()), {
    reply_markup: {
      keyboard: keyboards.origin,
      resize_keyboard:true,
    }
  });
  
  const id_now = '6547b346263e7efed3d9474c'; // node id от которого расходятся
  const id_next = '6547b9377e5f075443f41a00'; // node id к которому сходятся

  // const commentData = [
  //   "Могло было быть и лучше",
  //   "У меня прилив сил и я хочу это с кем то обсудить"
  // ];
  const commentData = [
    `Увлекательного общения, пока не надоест)`, 
    'Я ищу супер серьезных отношений ', 
    'Мне просто интересно, что будет дальше',
    'Больше романтики',
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
    saveAll(decisionAr, 0);
  }).then(() => {
    // save nodeObj
    const zero_node = NodeObj({
      _id: id_now,
      historyId: '6544f3939c8f1881fd48aea7',
      text: 'Чего ты ждешь от общения?',
      decisions:decisionAr.map(({_id}) => _id)
    });
    zero_node.save().then(() => log(chalk.blue.bgRed.bold('COMPLETE SAVE NODE')));
  }).catch(er => {
    console.log('SAVE ERROR', er)
  })

  
});

bot.onText(/\/file/, message => {
  const {id: chatId} = message.chat;
  bot.sendMessage('1387493009', "Я пока хз, что ты мне пишешь...");
});

bot.on('message', async (message) => {
  const {id: chatId } = message.chat;
  
  // need to check another passes
  // Еще нужно фильтровать входящие сообщения, чтобы они соответствовали номерам а иначе скип
  // Еще нужно фильтровать гифки, картинки и прочее, прочее...

  const username = message.from.username;
  // Контроллер ответов
  const userData = await User.findOne({username}).populate(['histories', 'myRooms']);

  if(userData && userData.currentHistory !== 'null') {
    if(checkMessageRouter(message.text)) return;
    const chooseInd = message.text[0];
    // внесение изменений в UserHistoryObj

    const workHis = findAndReturn(userData.histories, 'history_id', userData.currentHistory);

    const currentNodeObj = await NodeObj.findById(workHis.linkToNearNodeObj).populate(['decisions']);
    if(!currentNodeObj) return;

    const { nextNodeObj } = findAndReturn(currentNodeObj.decisions, 'index', chooseInd)
    
    
    await UserHistoryObj.updateOne({_id: workHis._id}, 
      {
        current_pos: workHis.current_pos+chooseInd,
        linkToNearNodeObj: nextNodeObj
      });
      
    // Get data for new keyboard
    const newNodeObj = await NodeObj.findById(nextNodeObj).populate(['decisions']);
    
    if(newNodeObj) {
      // show new keyboard
      // next step in test
      const keyboard = prepareKeyboard(newNodeObj.decisions);
      bot.sendMessage(chatId, newNodeObj.text, {
        reply_markup: {
          keyboard,
          resize_keyboard:true,
        }
      });
    } else {
      // end point
      // Поиск функции, определение комнаты, запись в комнату
      const {workRoom: preRoomData, newMyRoomObj} = await endPointHandler({bot, chatId, userData, pos: workHis.current_pos+chooseInd })
      // const roomData = await Room.findOne({unique_name}).populate(['members']);
      const roomData = await preRoomData.populate(['members']);
      const usersMyRooms = await MyRoom.find({room_id: roomData._id}).populate(['user_id']);

      const {str: resStr, noti} = prepareEndPointStr({roomData, userData, usersMyRooms});
      const { visible, notification } = newMyRoomObj;
      debugger
      const msgData = await bot.sendMessage(chatId, "(⌐■_■)", {
        reply_markup: {
          remove_keyboard: true
        }
      })
      await bot.deleteMessage(msgData.chat.id, msgData.message_id);
      await bot.sendMessage(chatId, resStr, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: visible ? 'Сделать невидимым' : 'Сделать видимым',
                callback_data: 'endp'+'invs'+(visible ? 'off' : 'onn'),
              }
            ],
            [
              {
                text: notification ? 'Отключить уведомления' : 'Включить уведомления',
                callback_data: 'endp'+'noot'+(notification ? 'off' : 'onn'),
              }
            ],
          ]
        },
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });

      await new Promise((resolve, reject) => {
        // уведомления
        const sendNotification = (arr, i) => {
          if(i < arr.length) {
            bot.sendMessage(arr[i].chatId, "Новые пользователи в группе (¬‿¬)", {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Смотреть",
                      callback_data: 'endp'+'invs'+'onn'
                    }
                  ]
                ]
              }
            }).then(() => {
              sendNotification(arr, i+1);
            })
          } else {
            resolve()
          }
        }
        // resolve();
        sendNotification(noti, 0);
      })
      log('noti', noti);
    }
    

    
    // cLog('success index handler');


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
      const str = `
      Основная идея бота заключается в том, чтобы подобрать для Вас человека с которым будет интересно общаться.\nДля этого необходимо выбрать тест из предлагаемых и ответить на все вопросы.\nЛюди, ответившие на все вопросы одинаково, попадают в группы, где они получают доступ к профилям друг друга.\nВ случае если Вы вернетесь на начальную страницу и повторно начнете проходить тест, то Вы будете удалены из предыдущей комнаты.\nВы можете одновременно находиться в 2х комнатах, если они относятся к разным тестам. Для того, чтобы приступить нажмите на кноку "К тестам"`
      
      bot.sendMessage(chatId, str, {
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
                  callback_data: 'prev'+_id,
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
  const pre = query.data.slice(0, 4);
  query.data = query.data.slice(4);

  let user = await User.findOne({username: query.from.username}).populate(['histories', 'myRooms']);

  if (pre === 'prev') {
  
  const { zero_node } = await History.findById(query.data);
  if(!debugSome(user.histories, ({history_id}) => ''+history_id === query.data)) {

    const uHO = UserHistoryObj(
      {
        history_id: query.data, 
        current_pos: '', 
        linkToNearNodeObj: zero_node,
      });
    await uHO.save();
    user.histories = [...user.histories, uHO._id]; 
  } else {
    const {_id} = findAndReturn(user.histories, 'history_id', query.data);
    await UserHistoryObj.updateOne({_id}, {linkToNearNodeObj: zero_node, current_pos: ''});
  }

  log('user  ', user);
  // Организовать чистку по myRooms
  // 
  const myRoomObj = findAndReturn(user.myRooms, 'history_id', query.data);
  if(myRoomObj) {
    // повторное прохождение
    // удаление пользователя из Room.members
    const room = await Room.findById(myRoomObj.room_id);
    let userInd = -1;
    room.members.forEach((el, i) => {if(''+el === ''+user._id) {userInd = i}});
    if(userInd > -1) {
      room.members.splice(userInd, 1);
    }
    await room.save();
    // удаление комнаты, чтобы не плодить мусор
    await MyRoom.findByIdAndDelete(myRoomObj._id);

    let myRoomObjInd = -1;
    user.myRooms.forEach(({history_id}, i) => {if(''+history_id === ''+query.data) {myRoomObjInd = i}});
    if(myRoomObjInd > -1) {
      user.myRooms.splice(myRoomObjInd, 1);
    }
  }

  // Дальнейшие действия
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

            const keyboard = prepareKeyboard(data.decisions.reverse());
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
  }


  if(pre === 'endp'){
    // endpoints moves
    const flag = query.data.slice(0, 4);
    const payload = query.data.slice(4);
    log('endp data: ', flag, payload);
    debugger
    const workMyRoom = findAndReturn(user.myRooms, 'history_id', user.currentHistory);

    const isTrue = payload === 'onn'
    const isInvi = flag === 'invs' 
    const newMyRoomObj = await MyRoom.findById(workMyRoom._id);
    newMyRoomObj.visible = isInvi ? isTrue : newMyRoomObj.visible;
    newMyRoomObj.notification = isInvi ? newMyRoomObj.notification : isTrue;
    await newMyRoomObj.save();
    debugger
    const roomData = await Room.findById(workMyRoom.room_id).populate(['members']);
    const usersMyRooms = await MyRoom.find({room_id: roomData._id});
    const {str: resStr} = prepareEndPointStr({roomData, userData:user, usersMyRooms
    });
    const { visible, notification } = newMyRoomObj;

    bot.sendMessage(chatId, resStr, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: visible ? 'Сделать невидимым' : 'Сделать видимым',
              callback_data: 'endp'+'invs'+(visible ? 'off' : 'onn'),
            }
          ],
          [
            {
              text: notification ? 'Отключить уведомления' : 'Включить уведомления',
              callback_data: 'endp'+'noot'+(notification ? 'off' : 'onn'),
            }
          ]
        ]
      },
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });

    // 
  }
  
})