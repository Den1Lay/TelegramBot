const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const NodeCache = require( "node-cache" );
const {History, User, NodeObj, Decision, UserHistoryObj, Room, MyRoom} = require('./models');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser').json();
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
const {
  profile_callback,
  profile_wakeup,
  show_mbti
} = require('./callback_handlers');
const { mainDev } = require('./dev');


const keyboards = require('./keyboards');
const kb = require('./keyboard_btns');

const log = console.log;
const cLog = pass => log(chalk.blue.bgRed.bold(pass));
const cacheBase = new NodeCache();

main().catch(err => console.log(err));

// ================================================================

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  if(mongoose.connection) {
    console.log('Success connect')
  }
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// ================================================================
const url = 'https://d88e-94-140-144-153.ngrok-free.app';
const port = 80;

// const bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY, {
//   polling: {
//     interval: 300, // Задержка прихода сообщения с клиента на сервер
//     autoStart: true, // Бот был не запущено и ему была отправлена команда -> он её обработает
//     params: {
//       timeout: 10 // Таймаут между запросами
//     }
//   }
// })

const bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY, {
  baseApiUrl: "http://0.0.0.0:8081"
});
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_BOT_KEY}`);
const app = express();
app.use(express.json());
// app.use(bodyParser, (req, res, next) => {
  
//   // console.log("REQ BODY", req);
//   next();
// });

app.post(`/bot${process.env.TELEGRAM_BOT_KEY}`, (req, res) => {
  console.time();
  // cLog("REQ BODY");
  // log(req.body);
  // console.log(req);
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  cacheBase.set('live_set_location', {data: []});
  cacheBase.set('live_photo_send', {data: []});
  cacheBase.set('live_set_name', {data: []});
  console.log(`Express server is listening on ${port}`);
});

// bot.onText(/\/money/, message => {

//   bot.sendPhoto(message.chat.id, fs.readFileSync(__dirname+'/cute.jpg'), {
//     caption: "Нет такого... 🎃👑♠💢 ",  
//     parse_mode: 'Markdown'
//   });
//   // bot.sendPhoto(message.chat.id, './gumboll_emoji.jpg');
// })

bot.onText(/\/start/, async message => {
  const {id: chatId} = message.chat

  if(!message.from.hasOwnProperty('username')) {
    bot.sendMessage(chatId, "Настройте username в настройках Telegram");
    return;
  }

  const { from: {first_name, username, language_code} } = message;

  let user = await User.findOne({username});
  const msgData = await resMsg(user?.mbti);
  if(!user) {
    user = User({
      username,
      showName:first_name,
      first_name,
      chatId,
      language_code,
      mbti: '',
      inTest: false,

      visible: 'close',
      geoX: 0,
      geoY: 0,
      photo: '',
      showText: '',
      wish: "friend",
      rate: 100,
      resp: [],
      checked: [],
    });
  };
  user.msgId = msgData.message_id;
  // выбросить. Инфа о сообщении всегда доступна в калбеке

  user.save()
    .then(() => {
      log(chalk.blue.bgRed.bold('Success save'))
    })
    .catch(er => console.log("Mongo err: ", er));

  async function resMsg(showGroup = false) {
    console.log("showGroup ", showGroup); 
    const resMsgData = await bot.sendMessage(chatId, "Основная информация", {
      reply_markup: {
        inline_keyboard: [
          showGroup ?
          [
            {
              text: "Профиль",
              callback_data: 'profile',
            },
            {
              text: "Группы",
              callback_data: 'groups'
            },
            {
              
            }
          ]
          :
          [
            {
              text: "Профиль",
              callback_data: 'profile',
            }
          ]
        ],
      },
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });
    console.log("resMsgData ", resMsgData);
    return resMsgData;
  }
});

bot.onText(/\/dev/, async message => {
  const {id: chatId} = message.chat;
  if(message.from.username !== 'Den1Lay') {
    await bot.sendMessage(chatId, "Используй кнопку 'Стартовая страница'");
    return 
  }
  console.log('show')
  
});

bot.on('message', async (message) => {
  const {id: chatId } = message.chat;
  const username = message.from.username;
  log('message: ', message);
  
  const user = await User.findOne({username});
  const check_location_data = message?.location;

  const live_set_location = cacheBase.get('live_set_location');
  // Контроллер изменения геолокации
  if(check_location_data) {
    await bot.sendMessage(chatId, "Ваши координаты обновлены", {
      reply_markup:{
        remove_keyboard: true
      }
    });
    log("check_location_data ", check_location_data);
    const { latitude, longitude } = check_location_data
    user.latitude = latitude;
    user.longitude = longitude;
    user.save().catch(er => log(er));
    profile_wakeup({user, bot, chatId});

    const usernameInd = live_set_location.data.indexOf(username);
    if(usernameInd != -1) {
      live_set_location.data.splice(usernameInd, 1);
      cacheBase.set('live_set_location', live_set_location);
    }
    return
  }

  // Контроль на лишние кнопки внизу
  if(live_set_location.data.includes(username)) {
    const usernameInd = live_set_location.data.indexOf(username);
    if(usernameInd != -1) {
      live_set_location.data.splice(usernameInd, 1);
      cacheBase.set('live_set_location', live_set_location);
    }
    const msgData = await bot.sendMessage(chatId, "(⌐■_■)", {
      reply_markup:{
        remove_keyboard: true
      }
    });
    bot.deleteMessage(chatId, msgData.message_id);
    return
  }
  
  // Контроллер изменения фото
  const check_photo_data = message?.photo;
  if(check_photo_data) {
    const live_photo_send = cacheBase.get('live_photo_send');

    if(live_photo_send.data.includes(username)) {
      
      bot.getFile(check_photo_data[check_photo_data.length-1].file_id).then((data) => {
        const usernameInd = live_photo_send.data.indexOf(username);
        live_photo_send.data.splice(usernameInd, 1);
        cacheBase.set('live_photo_send', live_photo_send);
        log('users_cache: ', live_photo_send);
        log("file data: ", data);
        const checkUserPhoto = user?.photo
        if(checkUserPhoto) {
          fs.unlink(checkUserPhoto, async er => {
            log(er);
            user.photo = data.file_path;
        
            user.save().catch(er => log(er));
            // нужно предварительно удалить старую фотку, чтобы не сжирать память
        
            profile_wakeup({user, bot, chatId, dlsMsg: 'Ваше фото обновлено\n'});
          });
        }
      })
      .catch(er => log(er));
    }
    return
  }

  const live_set_name = cacheBase.get('live_set_name');
  if(live_set_name.data.includes(username)) {
    const usernameInd = live_set_name.data.indexOf(username);
    live_set_name.data.splice(usernameInd, 1);
    cacheBase.set('live_set_name', live_set_name);

    user.showName = message.text;
    user.save().catch(er => log(er));

    profile_wakeup({user, bot, chatId, dlsMsg: 'Ваше имя обновлено\n'});
    return
  }
  
  // await bot.sendDocument(chatId, path.resolve(__dirname, 'Keil_v536.zip'));
  // console.log('message', message);
  console.timeEnd();

  return;
  // need to check another passes
  // Еще нужно фильтровать входящие сообщения, чтобы они соответствовали номерам а иначе скип
  // Еще нужно фильтровать гифки, картинки и прочее, прочее...

  // log(message, username);
  if(message.hasOwnProperty('location') && username === 'Den1Lay') {
    // log('backdoor');
    mainDev({userData, message, bot});
    return 
  };
  
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
        data.forEach(history => {
          const { _id, name, comment, zero_node, unique_name } = history;
          const resText = `${name}\n${comment}`
          const sendMsg = () => {
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
          }
          if(unique_name !== 'dev') {
            sendMsg();
          }
          if(unique_name === 'dev' && message.from.username === 'Den1Lay') {
            sendMsg();
          }
          
        });
      })
        
      break
  }
  
})

bot.on('callback_query', async query => {
  const {id: chatId} = query.message.chat;
  const callback_data = query.data;
  // query.data = query.data.slice(4);
  console.log("query ", query);

  let user = await User.findOne({username: query.from.username});
  const username = query.from.username;
  // нужно заменить на использование данных из кеша.

  if (callback_data === 'profile') {
    profile_callback({user, query, bot});
  }

  if(callback_data === 'set_geolocation') {
    const live_set_location = cacheBase.get('live_set_location');
    if(!live_set_location.data.includes(username)) {
      live_set_location.data.push(username);
      cacheBase.set('live_set_location', live_set_location);
    }
    bot.sendMessage(chatId, "Используйте кнопку ниже", {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Отправить координаты", 
              request_location: true
            }
          ]
        ],
        resize_keyboard:true,
      }
    })
  }

  if(callback_data === 'set_photo') {
    const live_photo_send = cacheBase.get('live_photo_send');
    if(!live_photo_send.data.includes(username)) {
      live_photo_send.data.push(username);
      cacheBase.set('live_photo_send', live_photo_send);
    }
    bot.sendMessage(chatId, "Отправьте 1 картинку");

    console.log("live_photo_send: ", live_photo_send);
  }

  if(callback_data === 'set_show_name') {
    const live_set_name = cacheBase.get('live_set_name');
    if(!live_set_name.data.includes(username)) {
      live_set_name.data.push(username);
      cacheBase.set('live_set_name', live_set_name);
    }
    bot.sendMessage(chatId, 'Напишите новое имя');

    console.log("live_photo_send: ", live_set_name);
  }

  if(callback_data === 'set_visible') {
    const cv = user.visible;
    user.visible = cv === 'close' ? 'open' : cv === 'open' ? 'like' : 'close'
    user.save().catch(er => log(er));
    profile_callback({user, query, bot}, false);
  }

  if(callback_data === 'set_wish') {
    const sw = user.wish;
    user.wish = sw === 'friend' ? 'relation' : 'friend';
    user.save().catch(er => log(er));
    profile_callback({user, query, bot}, false);
  }
 
  if(callback_data === 'choose_mbti') {
    show_mbti({user, query, bot});
  }

  if(callback_data.slice(0, 8) === 'set_mbti') {
    const payload_type = callback_data.slice(9);
    user.mbti = payload_type;
    user.save().catch(er => log(er));
    profile_callback({user, query, bot});
  }

  if(callback_data === 'return_profile') {
    profile_callback({user, query, bot});
  }
  
})