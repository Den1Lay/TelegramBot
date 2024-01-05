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
  show_mbti,
  groups_callback
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
const url = 'https://22ab-94-140-144-153.ngrok-free.app';
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
  cacheBase.set('live_set_text', {data: []});
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
      searchType: '',
      inTest: false,

      visible: 'close',
      latitude: 0,
      longitude: 0,
      photo: '',
      showText: '',
      wish: "friend",
      rate: 100,
      location_range: 0,
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
              callback_data: 'show_groups'
            }
          ]
          :
          [
            {
              text: "Профиль",
              callback_data: 'profile',
            }
          ] 
        ]
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

  (()=>{
    const x1 = 56.833363589186526, x2 = 60.65489663650853;
    const y1 = 56.82401417761019, y2 = 60.658022652338815;
    // const y1 = 56.84383720185981, y2 = 60.65342788385568;
    const diag = Math.sqrt((x1-y1)**2+(x2-y2)**2);
    console.log("diag ", diag);
    console.log('koef diag/1200m ', diag/1200);
    // diag = 0.01057 -- разница в 1 км. 
    // koef = 0.00000881341294661604
  })()
  
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
        const checkUserPhoto = user?.photo;
        console.log("checkUserPhoto ", checkUserPhoto);
        if(checkUserPhoto) {
          fs.unlink(checkUserPhoto, async er => {
            log(er);
            user.photo = data.file_path;
        
            user.save().catch(er => log(er));
            // нужно предварительно удалить старую фотку, чтобы не сжирать память
        
            profile_wakeup({user, bot, chatId, dlsMsg: 'Ваше фото обновлено\n'});
          });
        } else {
          user.photo = data.file_path;
          user.save().catch(er => log(er));
          profile_wakeup({user, bot, chatId, dlsMsg: 'Ваше фото обновлено\n'});
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

  const live_set_text = cacheBase.get('live_set_text');
  if(live_set_text.data.includes(username)) {
    log('live_set_text handler');
    const usernameInd = live_set_text.data.indexOf(username);
    live_set_text.data.splice(usernameInd, 1);
    cacheBase.set('live_set_text', live_set_text);

    user.showText = message.text;
    user.save().catch(er => log(er));

    profile_wakeup({user, bot, chatId, dlsMsg: 'Текст вашей карточки обновлен\n'});
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
    user.visible = cv === 'close' ? 'open' : 'close';
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

  if(callback_data === 'set_show_text') {
    const live_set_text = cacheBase.get('live_set_text');
    if(!live_set_text.data.includes(username)) {
      live_set_text.data.push(username);
      cacheBase.set('live_set_text', live_set_text);
    }
    bot.sendMessage(chatId, `Текущий текст:\n${user.showText.length ? '"'+user.showText+'"' : ''}\nДля изменения отправьте сообщение`, {
      reply_markup: {
        inline_keyboard: [
          [{
            text: "Удалить весь текст",
            callback_data: 'delete_show_text'
          }]
        ]
      }
    });
  }

  if(callback_data === 'delete_show_text') {
    user.showText = '';
    user.save().catch(er => log(er));
    profile_wakeup({bot, user, chatId });
  }

  // доделать...
  if(callback_data === 'show_my_card') {
    bot.sendPhoto(chatId, user.photo, {
      caption: `[${user.showName}](https://t.me/${user.username}) ${user.showText}`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Вернуть ся к профилю",
              callback_data: 'profile_wakeup'
            }
          ]
        ]
      }
    });
  }

  if(callback_data === 'profile_wakeup') {
    profile_wakeup({bot, user, chatId });
  }

  if(callback_data === 'show_groups') {
    groups_callback({user, query, bot});
  }

  const search_loop = async (isNext=false) => {

    let type = callback_data.slice(12, 16);
    if(isNext) {
      type = user.searchType;
    }
    user.searchType = type;
    const {location_range, latitude, longitude, resp, checked, wish} = user;
    const lat_koef = 0.01057;
    const lon_koef = 0.0169;

    const lat_low = latitude-lat_koef*location_range;
    const lon_low = longitude-lon_koef*location_range;
    const lat_high = latitude+lat_koef*location_range;
    const lon_high = longitude+lat_koef*location_range;

    const norArray = resp.concat(checked).map(usr => ({username: usr})).concat({username: user.username});
    console.log('norArray ', norArray);
    log({lat_low, lon_low, lat_high, lon_high});
    const search_obj = {$and:
      [
        {latitude: {$gt: lat_low}}, 
        {longitude: {$gt: lon_low}}, 
        {latitude: {$lt: lat_high}}, 
        {longitude: {$lt: lon_high}}, 
        {mbti: type},
        {wish},
        {visible: 'open'},
        {$nor: norArray},
      ]
    };
    log('search_obj ', JSON.stringify(search_obj));
    const showUser = await User.findOne(search_obj
      , {
        username: 1,
        showName: 1,
        showText: 1,
        photo: 1,
        latitude: 1,
        longitude: 1,
      }
    );
    return showUser
  }

  const search_card_and_show = async (isNext=false) => {
    let showUser = await search_loop(isNext);
    while(user.location_range < 4 && !showUser) {
      user.location_range = user.location_range*2;
      console.log("user.location_range", user.location_range);
      showUser = await search_loop(isNext);
    };

    if(showUser) {
      // вывод найденного пользователя
      user.checked.push(showUser.username);
      console.log("showUser", showUser);
      const {username, showName, showText, photo, latitude, longitude} = showUser;
      // добавить расстояние до цели)
      bot.sendPhoto(chatId, photo, {
        caption: `${showName} ${showText}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Like",
                callback_data: `like_${username}`
              }, 
              {
                text: "Next",
                callback_data: 'next'
              }
            ]
          ]
        }
      });
    } else {
      // вывод сообщения о том, что никого нет.
      console.log('Nobody (((');
      bot.sendMessage(chatId, "Nobody more", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "Смотреть снова",
              callback_data: `choose_type_${user.searchType}`
            }],
            [
              {
                text: "Вернуться к группам",
                callback_data: 'show_groups',
              }
            ]
          ]
        }
      })
    }
    user.save().catch(er => log(er));
  }

  const choose_type = callback_data.slice(0, 11);
  if(choose_type === 'choose_type') {
    user.location_range = 1;
    user.checked = [];

    search_card_and_show();
    // {$and:[{latitude: {$gt: 50}}, {latitude: {$lt:60}}, {longitude: {$gt:55}}, {longitude: {$lt: 65}}, {mbti: "intp"}, {$nor: [{username: "1Den1Lay"}]}]}
    return;
  }

  if(callback_data === 'next') {
    search_card_and_show(true);
  }

  const like_callback = callback_data.slice(0, 4);
  if(like_callback === 'like') {
    const payload_user = callback_data.slice(5);
    log('payload_user ', payload_user);

    const tUser = await User.findOne({username: payload_user}, {chatId});
    bot.sendPhoto(tUser.chatId, user.photo, {
      caption: `[${user.showName}](https://t.me/${user.username}) ${user.showText}`,
      parse_mode: 'Markdown',
      reply_markup: {
        remove_keyboard: true
      }
    });
  }
  
})