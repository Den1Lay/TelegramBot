const { getTestData } = require('./helpers');

const profileKeyboard = ({showName, wish, mbti, latitude, longitude, visible, photo, mySex, findSex}) => {
  const locateCheck = latitude !== 0 && longitude !== 0;
  const photoCheck = photo.length > 0;
  const resCheck = mbti.length && photoCheck && locateCheck;
  const resArr = [
    [
      {
        text: `Имя: ${showName}`,
        callback_data: 'set_show_name',
      },
      {
        text: "Изменить фото",
        callback_data: 'set_photo',
      } 
    ],
    [
      {
        text: `Мой пол: ${mySex === 'm' ? 'муж.' : 'жен.'}`,
        callback_data: 'set_mySex'
      },
      {
        text: visible === 'close' ? "Вас не видно" : visible === 'open' ? 'Вы видны всем' : 'Доступ через лайки', // Доступен все, Доступен по лайкам
        callback_data: 'set_visible'
      }
    ],
    [
      {
        text: locateCheck ? "Изменить местоположение" : "Установить местоположение", // изменяется в зависимости от текущего geoX, geoY
        callback_data: 'set_geolocation',
      }
    ],
    [
      // {
      //   text: `Ищу ${wish === 'friend' ? 'друзей' : 'отношения'}`,
      //   callback_data: 'set_wish'
      // },
      {
        text: `Показывать: ${findSex === 'm' ? 'муж.' : findSex === 'f' ? 'жен.' : 'всех'}`,
        callback_data: 'set_findSex'
      },
      {
        text: 'Изменить текст карточки',
        callback_data: 'set_show_text'
      }
    ],
    [
      {
        text: mbti ? mbti.toUpperCase() : 'Указать тип',
        callback_data: 'choose_mbti'
      },
      {
        text: 'Пройти тест',
        callback_data: 'test_start'
      }
    ],
    [
      // {
      //   text: "Группы",
      //   callback_data: 'show_groups'
      // }
    ],
    [
      {
        text: "Стартовая страница",
        callback_data: 'menu'
      },
      // {
      //   text: "Вид моей карточки",
      //   callback_data: 'show_my_card'
      // }
    ]
  ];

  if(resCheck) {
    resArr[5].push({
      text: "Группы",
      callback_data: 'show_groups'
    });
    resArr[6].push({
      text: "Вид моей карточки",
      callback_data: 'show_my_card'
    })
  }
  return resArr;
}

const mbtiKeyboard = () => {
  return ['SFJ', 'STJ', 'NFJ', 'NTJ', 'SFP', 'STP', 'NTP', 'NFP'].map(el=> {
    return [
      {
        text: 'E'+el,
        callback_data: `set_mbti_e${el.toLowerCase()}`
      },
      {
        text: 'I'+el,
        callback_data: `set_mbti_i${el.toLowerCase()}`
      },
    ]
  });
}

const groupKeyboard = (type) => {
  type = type.toUpperCase();
  // ISTP: -> ESTP, ESFP, ISFP
  const resArr = [`E${type[1]}T${type[3]}`, `I${type[1]}T${type[3]}`, `E${type[1]}F${type[3]}`, `I${type[1]}F${type[3]}`];
  const allTypes = ['SFJ', 'STJ', 'NFJ', 'NTJ', 'SFP', 'STP', 'NTP', 'NFP'].map(el => ['E'+el, 'I'+el]).flat();
  const filtered = allTypes.filter(el => !resArr.some(t => t === el));
  let result = resArr.map(type => [{
    text: `+${type}`,
    callback_data: `choose_type_${type.toLowerCase()}`
  }]);
  const dlsArr = [];
  for(let i = 0; i < filtered.length/2; i++) {
    const type1 = filtered[i*2];
    const type2 = filtered[i*2+1];
    dlsArr.push([
      {
        text: type1,
        callback_data: `choose_type_${type1.toLowerCase()}`
      },
      {
        text: type2,
        callback_data: `choose_type_${type2.toLowerCase()}`
      }
    ])
  }
  result = result.concat(dlsArr);
  console.log("dlsArr ", dlsArr);

  console.log("result ", result);
  result.push([{
    text: "Профиль",
    callback_data: 'profile'
  }])
  return result;
}

const prepare_markdown = (user, dlsMsg = '') => {
  const {latitude, longitude, photo, mbti} = user;
  const locateCheck = latitude !== 0 && longitude !== 0;
  const photoCheck = photo.length > 0;
  const resCheck = !mbti.length || !photoCheck || !locateCheck;

  const dls = `${!mbti.length ? '_тип личности MBTI,_ ' : ''}${!photo.length ? '_фото анкеты,_ ' : ''}${!locateCheck ? '_ваше местоположение._' : ''}`;
  const markdown = 
  `${dlsMsg}*Профиль*\nДля редактирования нажмите на соотвествующую кнопку\n${resCheck ? 'Для доступа к группам Вам еще необходимо указать:\n' : ''}${resCheck ? dls : ''}`;
  return markdown;
}

const  profile_callback = async ({user, query, bot, dlsMsg = ''}, updateText = true) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  // Здесь и происходят проверки и вывод дополнительной информации.
  // const {} = user;
  const markdown = prepare_markdown(user, dlsMsg);
  if(updateText) bot.editMessageText(markdown, {chat_id, message_id, parse_mode: 'Markdown'});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: profileKeyboard(user)
    }, 
    {chat_id, message_id}
  );
  // console.log("profile_callback ", {chat_id, message_id});
}

const profile_wakeup = async ({bot, user, chatId, dlsMsg = ''}) => {

  const markdown = prepare_markdown(user);
  bot.sendMessage(chatId, dlsMsg+markdown, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: profileKeyboard(user)
    }
  });
}

const show_mbti = async ({user, query, bot}) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;

  bot.editMessageText("Выберите тип", {chat_id, message_id});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: mbtiKeyboard()
    },
    {chat_id, message_id}
  )

}

const groups_callback = async ({user, query, bot}) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  bot.editMessageText("*Группы личностей.*\nРекомендуемые с +", {chat_id, message_id, parse_mode: 'Markdown'});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: groupKeyboard(user.mbti)
    },
    {chat_id, message_id}
  )
}

const groups_wakeup = async ({user, query, bot}) => {
  const chat_id = query.message.chat.id;

  bot.sendMessage(chat_id, "*Группы личностей.*\nРекомендуемые с +", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: groupKeyboard(user.mbti)
    }
  })
}

const preview_wakeup = async ({user={}, chatId, bot, process_data}) => {
  const {preview_1_path, preview_2_path, preview_3_path} = process_data;

  if(!preview_1_path.length || !preview_2_path.length || !preview_3_path.length) {
    bot.sendMessage(chatId, 'Нет файлов');
    return
  }
  // const preview1 = 'C:\\Programming\\JavaScript\\TelegramAPIServer\\telegram-bot-api\\bin\\6782913082~AAGMSBN2o6V0hEP0bnZJRn2pMvEeseW4KnM\\photos\\Prev1.jpg';
  // const preview2 = 'C:\\Programming\\JavaScript\\TelegramAPIServer\\telegram-bot-api\\bin\\6782913082~AAGMSBN2o6V0hEP0bnZJRn2pMvEeseW4KnM\\photos\\Prev2.jpg';
  await bot.sendMediaGroup(chatId, [
    {
      type: 'photo',
      media: preview_1_path,
      // capture: "Не агритесь за шакальное качество"
    },
    {
      type: 'photo',
      media: preview_2_path
    },
    {
      type: 'photo',
      media: preview_3_path
    },
  ]);
  return
}

const start_wakeup = async ({user, chatId, bot}) => {
  const {latitude, longitude, photo, mbti} = user;
  const locateCheck = latitude !== 0 && longitude !== 0;
  const photoCheck = photo.length > 0;
  const resCheck = mbti.length && photoCheck && locateCheck;

  const resArr = [
    {
      text: "Профиль",
      callback_data: 'profile_wakeup',
    }
  ];
  if (resCheck) {
    resArr.push({
      text: "Группы",
      callback_data: 'groups_wakeup'
    });
  }

  bot.sendMessage(chatId, `Используйте кнопки ниже.\nПри возникновении вопрос используйте команду "Описание" или обратитесь в тех поддержку.\nКонтакт в описании бота.`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        resArr
      ]
    }
  });
}

const test_start = ({user, query, bot}) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  const testData = getTestData();

  const {text1, text2} = testData[0][0];
  const resText = `Выберите утверждение, которое больше Вам подходит:\n1: ${text1}\n2: ${text2}\n`;

  bot.editMessageText(`*Добро пожаловать в тест.\nВопрос ${1}/71*\n${resText}`, {chat_id, message_id, parse_mode: 'Markdown'});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: [
        [{
          text: '1',
          callback_data: 'test_next_dNi'
        },
        {
          text: '2',
          callback_data: 'test_next_dNe'
        }],
        [{
          text: "Ничего",
          callback_data: 'test_next_z'
        }]
      ]
    },
    {chat_id, message_id}
  )
}

const test_next_step = ({user, query, bot, step, midMbti}) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  const testData = getTestData();
  // для определения текущего состояния используется step
  let resText = '';
  let inline_keyboard;
  if(step < 28) {
    // Часть double
    const question = testData[0][step];
    const {text1, text2} = question;
    resText = `Выберите утверждение, которое больше Вам подходит:\n1: ${text1}\n2: ${text2}\n`;
    inline_keyboard = prepareTypeD(question);
  }
  if(step >= 28 && step < 65) {
    // часть с минусом / плюсом
    const question = testData[0][step];
    const {text} = question;
    resText = `Согласные ли Вы с утверждением?\n\n ${text}\n`;
    inline_keyboard = prepareTypeS(question);
  }
  if(step >= 65) {
    const localStep = step - 65;
    const question = testData[1][midMbti][localStep];
    // console.log({midMbti, localStep, question});
    const {text} = question;
    resText =  `Согласные ли Вы с утверждением?\n\n ${text}\n`;
    inline_keyboard = prepareTypeS(question);
    
    // определение интро, экстро
    // использование midMbti
  }
  

  bot.editMessageText(`*Вопрос ${step+1}/71*\n${resText}`, {chat_id, message_id, parse_mode: 'Markdown'});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard
    },
    {chat_id, message_id}
  );

  function prepareTypeD ({slot1, slot2}) {
    return [
      [{
        text: '1',
        callback_data: `test_next_d${slot1}`
      },
      {
        text: '2',
        callback_data: `test_next_d${slot2}`
      }],
      [{
        text: "Ничего",
        callback_data: 'test_next_z'
      }]
    ]
  }

  function prepareTypeS ({slot}) {
    return [
      [
        {
          text: 'Да',
          callback_data: `test_next_s${slot}+`
        },
        {
          text: 'Нет',
          callback_data: `test_next_s${slot}-`
        },
      ],
      [
        {
          text: 'Не уверен в ответе',
          callback_data: 'test_next_z'
        }
      ]
    ]
  }
}

module.exports = {
  profile_callback,
  profile_wakeup,
  show_mbti,
  groups_callback,
  groups_wakeup,
  start_wakeup,
  test_start,
  test_next_step,
  preview_wakeup
}