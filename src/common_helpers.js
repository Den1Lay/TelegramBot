const { User } = require('./models');

const getPhotoName = (fullPath) => {
  const fullLen = fullPath.length

  const checkSimbol = process.env.prod === '1' ? '/' : '\\';

  // console.log({checkSimbol, prod: process.env.prod});
  let i = 4;
  while(1) {
    if(fullPath[fullLen-1-i] === checkSimbol) {
      break
    }
    i++;
  }
  
  return fullPath.slice(fullLen-i);
}

const likesUpdate = ({user}) => {
  const searchLike = user?.searchLike;
  const acceptLike = user?.acceptLike;
  const lastLikeUpdate = user?.lastLikeUpdate;
  const checkArr = [searchLike, acceptLike, lastLikeUpdate];
  let returnFlag = false;

  const currentTime = new Date();
  const twoWeekDiff = 1209600000;
  if(checkArr.every(el => el != undefined)) {
    console.log("work process");
    if(Number(currentTime) - Number(lastLikeUpdate) > twoWeekDiff) {
      // update likes

      user.searchLike = 5;
      user.acceptLike = 5;
      user.lastLikeUpdate = currentTime;

      returnFlag = true;
    }
  }
  console.log({searchLike, acceptLike, lastLikeUpdate, currentTime});
  return returnFlag;
}

const testCleaner = ({cacheBase, bot}) => {
  const live_mbti_data = cacheBase.get('live_mbti_data');
  console.log("test clear: ", live_mbti_data);
  // User.find({$or: [{}] })
  live_mbti_data.data.forEach(({chatId} ) => {
    bot.sendMessage(chatId, "Ваши результаты обнулены.\nПройдите тест заново.", {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Профиль",
              callback_data: 'profile'
            }
          ]
        ]
      }
    });
  });

  cacheBase.set('live_mbti_data', {users: [], data: []});
}

const computeRange = ({latitude: lat, longitude: lon, tLat, tLon}) => {
  
  const lat_koef = 0.01057;
  const lon_koef = 0.016;
  const range = Math.sqrt(Math.pow((lat - tLat)/lat_koef, 2) + Math.pow((lon - tLon)/lon_koef, 2));

  return range;
}

const checkReadyToShow = (user) => {
  const { mbti, latitude, longitude, photo, readyToShow } = user;
  if(readyToShow) {
    return
  } else {
    if(mbti.length && (latitude > 0) && (longitude > 0) && photo.length) {
      user.readyToShow = true;
    }
  }

}

module.exports = {
  getPhotoName,
  likesUpdate,
  testCleaner,
  computeRange,
  checkReadyToShow
}