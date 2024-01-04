const profileKeyboard = ({showName, wish, mbti, latitude, longitude, visible}) => {
  const locateCheck = latitude !== 0 && longitude !== 0;
  return [
    [
      {
        text: showName,
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
      {
        text: "Назад",
        callback_data: 'menu'
      },
      {
        text: "Вид моей карточки",
        callback_data: 'show_my_card'
      }
    ]
  ]
}

const mbtiKeyboard = () => {
  return [
    [
      {
        text: "ESFJ",
        callback_data: 'set_mbti_esfj',
      },
      {
        text: "ISFJ",
        callback_data: 'set_mbti_isfj',
      } 
    ],
    [
      {
        text: "ESTJ",
        callback_data: 'set_mbti_estj',
      },
      {
        text: "ISTJ",
        callback_data: 'set_mbti_istj',
      } 
    ],
    [
      {
        text: "ENFJ",
        callback_data: 'set_mbti_enfj',
      },
      {
        text: "INFJ",
        callback_data: 'set_mbti_infj',
      } 
    ],
    [
      {
        text: "ENTJ",
        callback_data: 'set_mbti_entj',
      },
      {
        text: "INTJ",
        callback_data: 'set_mbti_intj',
      } 
    ],
    [
      {
        text: "ISFP",
        callback_data: 'set_mbti_isfp',
      },
      {
        text: "ESFP",
        callback_data: 'set_mbti_esfp',
      } 
    ],
    [
      {
        text: "ISTP",
        callback_data: 'set_mbti_istp',
      },
      {
        text: "ESTP",
        callback_data: 'set_mbti_estp',
      } 
    ],
    [
      {
        text: "INFP",
        callback_data: 'set_mbti_infp',
      },
      {
        text: "ENFP",
        callback_data: 'set_mbti_enfp',
      } 
    ],
    [
      {
        text: "INTP",
        callback_data: 'set_mbti_intp',
      },
      {
        text: "ENTP",
        callback_data: 'set_mbti_entp',
      } 
    ],
    [
      {
        text: 'Назад',
        callback_data: 'return_profile'
      }
    ]
  ]
}

const  profile_callback = async ({user, query, bot}, updateText = true) => {
  const chat_id = query.message.chat.id;
  const message_id = query.message.message_id;
  
  if(updateText) bot.editMessageText("Профиль\nДля редактирования нажмите на соотвествующую кнопку", {chat_id, message_id});
  bot.editMessageReplyMarkup(
    {
      inline_keyboard: profileKeyboard(user)
    }, 
    {chat_id, message_id}
  );
  console.log("profile_callback ", {chat_id, message_id});
}

const profile_wakeup = async ({bot, user, chatId, dlsMsg = ''}) => {

  bot.sendMessage(chatId, dlsMsg+"Профиль", {
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

module.exports = {
  profile_callback,
  profile_wakeup,
  show_mbti
}