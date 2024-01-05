const profileKeyboard = ({showName, wish, mbti, latitude, longitude, visible, photo}) => {
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
      {
        text: `Ищу ${wish === 'friend' ? 'друзей' : 'отношения'}`,
        callback_data: 'set_wish'
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
        text: "Назад",
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
    text: "Назад",
    callback_data: 'profile'
  }])
  return result;
}

const prepare_markdown = (user) => {
  const {latitude, longitude, photo, mbti} = user;
  const locateCheck = latitude !== 0 && longitude !== 0;
  const photoCheck = photo.length > 0;
  const resCheck = !mbti.length || !photoCheck || !locateCheck;

  const dls = `${!mbti.length ? '_тип личности MBTI,_ ' : ''}${!photo.length ? '_фото анкеты,_ ' : ''}${!locateCheck ? '_ваше местоположение,_' : ''}`;
  const markdown = 
  `*Профиль*\nДля редактирования нажмите на соотвествующую кнопку\n${resCheck ? 'Для доступа к группам Вам еще необходимо указать:\n' : ''}${resCheck ? dls : ''}`;
  return markdown;
}

const  profile_callback = async ({user, query, bot}, updateText = true) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  // Здесь и происходят проверки и вывод дополнительной информации.
  // const {} = user;
  const markdown = prepare_markdown(user);
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
  bot.editMessageText("Группы личностей.\nРекомендуемые с +", {chat_id, message_id});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: groupKeyboard(user.mbti)
    },
    {chat_id, message_id}
  )
}

module.exports = {
  profile_callback,
  profile_wakeup,
  show_mbti,
  groups_callback,
}