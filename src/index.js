const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const NodeCache = require( "node-cache" );
const { User, MbtiData } = require('./models');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser').json();
require('dotenv').config()

const {
  profile_callback,
  profile_wakeup,
  show_mbti,
  groups_callback,
  groups_wakeup,
  start_wakeup,
  test_start,
  test_next_step,
  preview_wakeup,
} = require('./callback_handlers');
const {
  getMbtiDataObj,
  updateMbtiData,
  calcMidMbti
} = require('./helpers.js')

const {
  getPhotoName,
  testCleaner,
  computeRange,
  checkReadyToShow
} = require('./common_helpers.js');
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
// const url = 'https://22ab-94-140-144-153.ngrok-free.app';
const url = process.env.API_URL
const port = process.env.LIVE_PORT;

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
  const picturePath = path.resolve(__dirname, '..', '..', 'decode_pictures');
  fs.access(picturePath, (er) => {
    if(er) {
      log('fs.access error: ', er);
      fs.mkdir(picturePath, (er) => {
        if(er) log('fs.mkdir error: ', er);
      })
    }
  });

  cacheBase.set('live_set_location', {data: []});
  cacheBase.set('live_photo_send', {data: []});
  cacheBase.set('live_set_name', {data: []});
  cacheBase.set('live_set_text', {data: []});
  cacheBase.set('live_mbti_data', {data: [], users: []});

  cacheBase.set('admin_set_photo_1', false);
  cacheBase.set('admin_set_photo_2', false);
  cacheBase.set('admin_set_db', false);
  cacheBase.set('process_data', {preview_1_path: '', preview_2_path: '', preview_3_path: ''});
  
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
  // const msgData = await resMsg(user?.mbti);

  if(!user) {
    const mbtiData = await MbtiData().save();
    user = User({
      username,
      showName:first_name,
      first_name,
      mySex: "m",
      findSex: "f",

      chatId,
      language_code,
      mbti: '',
      mbtiData: mbtiData._id,
      searchType: '',
      inTest: false,

      visible: 'open',
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
  if(user.firstStart) {
    const process_data = cacheBase.get('process_data');
    await preview_wakeup({chatId: chatId, bot, process_data});
    user.firstStart = false;
    // user.save().catch(er => log(er));
  }
  start_wakeup({user, chatId, bot});
  // user.msgId = msgData.message_id;
  // выбросить. Инфа о сообщении всегда доступна в калбеке

  user.save()
    .then(() => {
      log(chalk.blue.bgRed.bold('Success save'))
    })
    .catch(er => console.log("Mongo err: ", er));
});

bot.onText(/\/preview/, async message => {
  const {id: chatId} = message.chat;
  const process_data = cacheBase.get('process_data');
  preview_wakeup({chatId: chatId, bot, process_data});
})

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


  if(username === 'Den1Lay') {
    // точка входа разработчика
    if(message.text === 'clear_cache') {
      log("start clear setInterval");
      setInterval(() => testCleaner({cacheBase, bot}), 1*60*1000);
    } 

    if(message.text === 'setup_photo_1') {
      cacheBase.set('admin_set_photo_1', true);
    }

    if(message.text === 'setup_photo_2') {
      cacheBase.set('admin_set_photo_2', true);
    }

    if(message.text === 'setup_photo_3') {
      cacheBase.set('admin_set_photo_3', true);
    }

    if(message.text === 'get_db') {
      User.find().then((data) => {
        log({usersData: data});
        const json = JSON.stringify(data);
        const file_path = path.join(__dirname, 'db_data.json');
        fs.writeFile(file_path, json, (er) => {
          if(er) {
            log({er});
          }
          bot.sendDocument(chatId, file_path);
        })
        
      })
    }

    if(message.text === 'set_db') {
      cacheBase.set('admin_set_db', true);
    }

    const check_photo_data = message?.photo;
    const admin_set_photo_1 = cacheBase.get('admin_set_photo_1');
    const admin_set_photo_2 = cacheBase.get('admin_set_photo_2');
    const admin_set_photo_3 = cacheBase.get('admin_set_photo_3');
    const saveAndUpdatePath = ({data, key, fixedName='prev.jpg'}) => {
      // const photoName = getPhotoName(data.file_path);
      fs.readFile(data.file_path, (er, buf) => {
        if(er) log("fs.readFile setPhoto er ", er);
        const nearPath = path.resolve(__dirname, '..', '..', 'decode_pictures', fixedName);

        fs.writeFile(nearPath, buf, (er) => {
          if(er) log("fs.writeFile setPhoto er ", er);

          const process_data = cacheBase.get('process_data');
          process_data[key] = nearPath;
          log({process_data});
          cacheBase.set('process_data', process_data);
        });
      })
    }

    if(check_photo_data && admin_set_photo_1) {
      bot.getFile(check_photo_data[check_photo_data.length-1].file_id)
      .then(data => {
        log({fileData: data});
        // 'process_data', {preview_1_path: '', preview_2_path: ''}
        saveAndUpdatePath({data, key: 'preview_1_path', fixedName: 'prev1.jpg'});
      })
      .catch(er => log(er));
      cacheBase.set('admin_set_photo_1', false);
    }

    if(check_photo_data && admin_set_photo_2) {
      bot.getFile(check_photo_data[check_photo_data.length-1].file_id)
      .then(data => {
        log({fileData: data});
        // 'process_data', {preview_1_path: '', preview_2_path: ''}
        saveAndUpdatePath({data, key: 'preview_2_path', fixedName: 'prev2.jpg'});
      })
      .catch(er => log(er));
      cacheBase.set('admin_set_photo_2', false);
    }

    if(check_photo_data && admin_set_photo_3) {
      bot.getFile(check_photo_data[check_photo_data.length-1].file_id)
      .then(data => {
        log({fileData: data});
        // 'process_data', {preview_1_path: '', preview_2_path: ''}
        saveAndUpdatePath({data, key: 'preview_3_path', fixedName: 'prev3.jpg'});
      })
      .catch(er => log(er));
      cacheBase.set('admin_set_photo_3', false);
    }

    const check_document_data = message?.document;
    const admin_set_db = cacheBase.get('admin_set_db');

    if(check_document_data && admin_set_db) {
      bot.getFile(check_document_data.file_id).then(data => {
        log({documentData: data});

        fs.readFile(data.file_path, (er, data) => {
          const db_data_obj = JSON.parse(data);
          log({db_data_obj});
          cacheBase.set('admin_set_db', false);
          // доделать
        })
        
      })
    }

    if(message?.text) {
      if(message.text[0] == '1') {
        const process_data = cacheBase.get('process_data');
        log({process_data});
      }
    }
  }
  // публичная часть
  

  

  // отладка.
  // if(message.text[0] = '+') {
  //   const {data, users} = cacheBase.get('live_mbti_data');
  //   if(users.length) {
  //     data[0].mbtiDataObj.step = data[0].mbtiDataObj.step+10;

  //     cacheBase.set('live_mbti_data', {users, data});
  //   }
  // }

  // (()=>{
  //   const x1 = 56.833363589186526, x2 = 60.65489663650853;
  //   const y1 = 56.82401417761019, y2 = 60.658022652338815;
  //   // const y1 = 56.84383720185981, y2 = 60.65342788385568;
  //   const diag = Math.sqrt((x1-y1)**2+(x2-y2)**2);
  //   console.log("diag ", diag);
  //   console.log('koef diag/1200m ', diag/1200);
  //   // diag = 0.01057 -- разница в 1 км. 
  //   // koef = 0.00000881341294661604
  // })()
  
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

    checkReadyToShow(user);
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

        const saveAndUpdateUserPhoto = () => {

          
          const fileName = getPhotoName(data.file_path);
          const nearPath = path.resolve(__dirname, '..', '..', 'decode_pictures', fileName);
          log("saveAndUpdateUserPhoto");
          fs.readFile(data.file_path, (er, buf) => {
            if(er) log('user photo fs.readFile error: ', er);
            fs.writeFile(nearPath, buf, (er) => {
              if(er) log('user photo fs.writeFile error: ', er);

              user.photo = nearPath;
              checkReadyToShow(user);
              user.save().catch(er => log(er));
              profile_wakeup({user, bot, chatId, dlsMsg: 'Ваше фото обновлено\n'});
            })
          })
        }

        if(checkUserPhoto) {
          // нужно предварительно удалить старую фотку, чтобы не сжирать память
          fs.open(checkUserPhoto, 'r', (er) => {
            if(er) {
              log('checkUserPhoto fs.open error: ', er);
              saveAndUpdateUserPhoto();
            } else {
              fs.unlink(checkUserPhoto, async er => {
                log(er);
                saveAndUpdateUserPhoto();
              });
            }
          })

        } else {
          saveAndUpdateUserPhoto();
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
})


// callbacks
bot.on('callback_query', async query => {
  const {id: chatId} = query.message.chat;
  const callback_data = query.data;
  // query.data = query.data.slice(4);
  console.log("query ", query);

  let user = await User.findOne({username: query.from.username});
  const username = query.from.username;
  debugger
  // нужно заменить на использование данных из кеша.
  log({callback_query_user: user});
  // const mid1Flag = likesUpdate({user});
  let hardSaveFlag = false;

  if (callback_data === 'profile') {
    profile_callback({user, query, bot});
  }

  if(callback_data === 'set_geolocation') {
    clearCache(user);
    const live_set_location = cacheBase.get('live_set_location');
    if(!live_set_location.data.includes(username)) {
      live_set_location.data.push(username);
      cacheBase.set('live_set_location', live_set_location);
    }
    // удалить всех остальных
    // нужна функция clean every cache
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
    clearCache(user);

    if(!live_photo_send.data.includes(username)) {
      live_photo_send.data.push(username);
      cacheBase.set('live_photo_send', live_photo_send);
    }
    bot.sendMessage(chatId, "Отправьте 1 картинку");

    console.log("live_photo_send: ", live_photo_send);
  }

  if(callback_data === 'set_show_name') {
    clearCache(user);
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
    hardSaveFlag = false;

    profile_callback({user, query, bot}, false);
  }

  if(callback_data === 'set_wish') {
    const sw = user.wish;
    user.wish = sw === 'friend' ? 'relation' : 'friend';
    user.save().catch(er => log(er));
    hardSaveFlag = false;

    profile_callback({user, query, bot}, false);
  }
 
  if(callback_data === 'choose_mbti') {
    show_mbti({user, query, bot});
  }

  if(callback_data.slice(0, 8) === 'set_mbti') {
    const payload_type = callback_data.slice(9);
    user.mbti = payload_type;
    checkReadyToShow(user);
    user.save().catch(er => log(er));
    hardSaveFlag = false;

    profile_callback({user, query, bot});
  }

  if(callback_data === 'return_profile') {
    profile_callback({user, query, bot});
  }

  if(callback_data === 'set_show_text') {
    clearCache(user);
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
    hardSaveFlag = false;

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
              text: "Вернуться к профилю",
              callback_data: 'profile_wakeup'
            }
          ]
        ]
      }
    });
  }

  if(callback_data === 'set_findSex') {
    // user.findSex = user.findSex === 'm' ? 'f' : user.findSex === 'f' ? 'm' : 'a';
    if (user.findSex === 'm') user.findSex = 'f';
    else if (user.findSex === 'f') user.findSex = 'm';
    // else if (user.findSex === 'a') user.findSex = 'm';
    user.save().catch(er => log(er));
    hardSaveFlag = false;

    profile_callback({user, query, bot}, false);
  }

  if(callback_data === 'set_mySex') {
    user.mySex = user.mySex === 'm' ? 'f' : 'm';
    user.save().catch(er => log(er));
    hardSaveFlag = false;

    profile_callback({user, query, bot}, false);
  }

  if(callback_data === 'profile_wakeup') {
    profile_wakeup({bot, user, chatId });
  }

  if(callback_data === 'show_groups') {
    groups_callback({user, query, bot});
  }

  if(callback_data === 'groups_wakeup') {
    groups_wakeup({user, query, bot});
  }

  const search_loop = async (isNext=false) => {

    let type = callback_data.slice(12, 16);
    if(isNext) {
      type = user.searchType;
    }
    user.searchType = type;
    const {location_range, latitude, longitude, resp, checked, wish, findSex, mySex} = user;
    const lat_koef = 0.01057;
    const lon_koef = 0.0169;

    const lat_low = latitude-lat_koef*location_range;
    const lon_low = longitude-lon_koef*location_range;
    const lat_high = latitude+lat_koef*location_range;
    const lon_high = longitude+lat_koef*location_range;

    const norArray = resp.concat(checked).map(usr => ({username: usr})).concat({username: user.username});
    console.log('norArray ', norArray);
    log({lat_low, lon_low, lat_high, lon_high});
    // const searchArr = 
    const search_obj = {$and:
      [
        {latitude: {$gt: lat_low}}, 
        {longitude: {$gt: lon_low}}, 
        {latitude: {$lt: lat_high}}, 
        {longitude: {$lt: lon_high}}, 
        {mbti: type},
        {mySex:findSex},
        {findSex: mySex},
        // {wish},
        {readyToShow: true},
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
        deathLikes: 1,
        mbti: 1,
      }
    );
    return showUser
  }

  const search_card_and_show = async (isNext=false) => {
    let showUser = await search_loop(isNext);
    while(user.location_range < 10 && !showUser) {
      user.location_range = user.location_range*2;
      console.log("user.location_range", user.location_range);
      showUser = await search_loop(isNext);
    };

    if(showUser) {
      // debugger
      // вывод найденного пользователя
      user.checked.push(showUser.username);
      // user.checked.push(showUser.username);
      console.log("showUser", showUser);
      const {username, showName, showText, photo, latitude: tLat, longitude: tLon, deathLikes: showDeathLikes, mbti} = showUser;
      // добавить расстояние до цели)
      const {latitude, longitude} = user;
      const range = computeRange({latitude, longitude, tLat, tLon});
      log({range});

      bot.sendPhoto(chatId, photo, {
        caption: `*${showName}*\n${showText}\nТип личности: ${mbti.toUpperCase()}\n📍${range.toFixed(2)} км\n🖤 лайки: ${showDeathLikes}`,
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
    log({userAfterShowUser: user});
    user.save().catch(er => log(er));
    hardSaveFlag = false;
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
    if(!user.resLikes.includes(payload_user)) {
      const tUser = await User.findOne({username: payload_user}, {chatId: 1, username: 1});
    
      const {showName, showText, photo, mbti} = user;
      let showDeathLikes = user?.deathLikes === undefined ? 0 : user?.deathLikes;
      
      bot.sendPhoto(tUser.chatId, photo, {
        caption: `*${showName}*\n${showText}\nТип личности: ${mbti.toUpperCase()}\n🖤 лайки: ${showDeathLikes}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Начать общение ❤",
                callback_data: `accept_like_${username}`
              }, 
              {
                text: "Отказать",
                callback_data: 'reject_like'
              }
            ]
          ]
        }
      });

      const message_id = query.message.message_id;
      bot.editMessageReplyMarkup({
        inline_keyboard: [
          [{
            text: "Next",
            callback_data: 'next'
          }]
        ]
      }, {
        chat_id: chatId,
        message_id: message_id
      })

      // user.resLikes.push(tUser.username);
      user.save().catch(er => log({er}));

    } else {
      log("like already sended");
    }
  }

  const accept_like = callback_data.slice(0, 11);
  if(accept_like === 'accept_like') {
    const payload = callback_data.slice(12);
    log({accept_like, payload});

    const tUser = await User.findOne({username: payload}, {showName: 1, username: 1, photo: 1, showText: 1, deathLikes: 1, mbti: 1});
    const message_id = query.message.message_id;
    bot.deleteMessage(chatId, message_id);
    log({tUser});
    const {showName, username, photo, showText, deathLikes: showDeathLikes, mbti} = tUser;

    bot.sendPhoto(chatId, photo, {
      caption: `Ссылка на пользователя: [${showName}](https://t.me/${username})\n${showText}\nТип личности: ${mbti.toUpperCase()}\n🖤 лайки: ${showDeathLikes}\nУдачного общения 🍇`,
      parse_mode: 'Markdown',
      reply_markup: {
        remove_keyboard: true
      }
    });
    
    user.deathLikes+=1;
    user.save().catch(er => log({er}));
    
    return;
  }
  
  const reject_like = callback_data.slice(0, 11);
  if(reject_like === 'reject_like') {
    log({reject_like});
    const message_id = query.message.message_id;
    bot.deleteMessage(chatId, message_id);
  }

  
  if(callback_data === 'menu') {
    start_wakeup({user, chatId: chatId, bot});
  }

  if(callback_data === 'test_start') { // протестировать
    // Необходимо обнулить текущие результаты теста
    // Необходимо обнулить текущий кеш
    const {users, data} = cacheBase.get('live_mbti_data');
    // log({users, data});
    if(users.includes(user.username)) {
      const ind = users.indexOf(user.username);
      users.splice(ind, 1);
      for(let i = 0; i < data.length; i++) {
        if(data[i].username === user.username) {
          data.splice(i, 1);
        }
      }
    }

    // log({users, data});
    const mbtiDataObj = getMbtiDataObj();
  
    users.push(user.username);
    data.push({username: user.username, mbtiDataObj, chatId});
    // log({users, data, mbtiDataObj});
    cacheBase.set('live_mbti_data', {users, data});
    
    await MbtiData.updateOne({_id: user.mbtiData}, mbtiDataObj);

    test_start({user, query, bot});
  };


  const test_next = callback_data.slice(0, 9);
  // log({test_next});
  if(test_next === 'test_next') {
    const flag = callback_data[10];
    const {users, data} = cacheBase.get('live_mbti_data');
    let userInd = -1;
    for(let i = 0; i < data.length; i++) {
      if(data[i].username === user.username) {
        userInd = i;
        break
      }
    }
    // log({userInd});
    
    if(userInd === -1) {
      return
    }

    const cacheDataObj = data[userInd].mbtiDataObj;
    // log({cacheDataObj});
    // обработка сообщений
    let midMbti = {payload: '', full: ''};
    if(cacheDataObj.step >= 64) {
      // необходимо определить после какого вопроса необходимо считать midMbti
      midMbti = calcMidMbti(cacheDataObj);
    }
    if(flag === 'd') {
      const fun = callback_data.slice(11, 13);
      updateMbtiData({cacheDataObj, fun, flag});
    }

    if(flag === 's') {
      const fun = callback_data.slice(11, 14);
      const plus = callback_data.slice(14, 15) === '+';
      log({fun, plus});
      updateMbtiData({cacheDataObj, fun, flag, plus});
    }

    if(flag === 'z') {
      cacheDataObj.step = cacheDataObj.step + 1;
    }

    
    if(cacheDataObj.step >= 71) {
      // обработка конечных результатов и выход в профиль
      log("end point");
      log({cacheDataObj});
      const {E, I} = cacheDataObj;
      const {full, payload} = midMbti;
      let dlsSimb = E > I ? 'e' : 'i';
      let resType;
      if(E === I) {
        resType = full;
        // ориентирование на результат из теста
        // dlsSimb = Math.random() > 0.5 ? 'e' : 'i';
      } else {
        resType = `${dlsSimb}${payload}`;
      }
      user.mbti = resType.toLowerCase();
      user.save().catch(er => log(er));
      hardSaveFlag = false;

      profile_callback({user, query, bot, dlsMsg: `Ваш тип личности: _${user.mbti}_. Данные профиля обновлены.\n\n`});
      
      // очистка кеш, хранилища
      const usersInd = users.indexOf(user.username);
      users.splice(usersInd, 1);
      data.splice(userInd, 1);
      cacheBase.set('live_mbti_data', {users, data});
      log({users, data});
      return;
    }

    data[userInd].mbtiDataObj = cacheDataObj;
    cacheBase.set('live_mbti_data', {users, data});
    test_next_step({user, query, bot, step: cacheDataObj.step, midMbti: midMbti.payload});
    
  }

  // log("end point process");
  if(hardSaveFlag) {
    log('end point hard save');
    user.save().catch(er => log({head: "end point process", er}));
  }
})



function clearCache(user) {
  const username = user.username;
  // const {data: locData} = cacheBase.get('live_set_location');
  const {data: photoData} = cacheBase.get('live_photo_send');
  const {data: nameData} = cacheBase.get('live_set_name');
  const {data: textData} = cacheBase.get('live_set_text');

  // const locDataInd = locData.indexOf(username);
  const photoDataInd = photoData.indexOf(username);
  const nameDataInd = nameData.indexOf(username);
  const textDataInd = textData.indexOf(username);
  
  // if(locDataInd != -1) {
  //   locData.splice(locDataInd, 1);
  //   cacheBase.set('live_set_location', {data: locData});
  // }

  if(photoDataInd != -1) {
    photoData.splice(photoDataInd, 1);
    cacheBase.set('live_photo_send', {data: photoData});
  }
  
  if(nameDataInd != -1) {
    nameData.splice(nameDataInd, 1);
    cacheBase.set('live_set_name', {data: nameData});
  }

  if(textDataInd != -1) {
    textData.splice(textDataInd, 1);
    cacheBase.set('live_set_text', {data: textData});
  }

  // log({locDataInd, photoDataInd})
  log({photoData, nameData, textData});
}