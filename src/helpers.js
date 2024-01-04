const chalk = require('chalk');
const vm = require('vm');

const log = console.log;
const cLog = pass => log(chalk.blue.bgRed.bold(pass));
const {History, User, NodeObj, Decision, UserHistoryObj, Room, MyRoom} = require('./models');
const myRoom = require('./models/MyRoom');


const debug = (obj={}) => {
  return JSON.stringify(obj, null, 4);
}

const debugSome = (arr, func) => {
  let resValue = false;
  arr.forEach((el, i) => {
    const funcRes = func(el, i);
    if(funcRes) {resValue = true}
  });
  return resValue;
}

const findAndReturn = (arr, objParam, etalon) => {
  let resInd = 0;
  for(let i = 0; i < arr.length; i++) {
    if(''+arr[i][objParam] === ''+etalon) {
      resInd = i;
      break
    }
  }
  if(arr.length > 0) {
    return arr[resInd];
  } else {  
    return null
  }
}

const checkMessageRouter = (pass) => {
  if(!pass) return true;
  const fSimbol = pass[0];
  const checkArr = Array(10).fill('').map((el, i) => ''+i);
  return !checkArr.some(el => el === fSimbol);
}


const prepareKeyboard = arr => {
  const resArr = [];
  let localStorage = [];
  let i = 0;
  let l = 0
  while(i < arr.length) {
    if(arr[i].comment.length > 35) {
      resArr.push([`${i}: ${arr[i].comment}`]);
      l = 0;
    } else {
      localStorage.push(`${i}: ${arr[i].comment}`);
      if(l > 0) {
        resArr.push(localStorage);
        localStorage = [];
        l = 0;
      }
      l++;
    }
    i++;
  }
  if(localStorage.length) resArr.push(localStorage)
  return resArr;
}


const endPointHandler = async (pass) => {
  debugger
  const {bot, chatId, userData, pos} = pass;
  const historyObj = await History.findById(userData.currentHistory);
  historyObj.pos = pos;
  vm.createContext(historyObj);
  
  // преобразовать в строку.. 
  // const roomRouter = ({historyObj, pos}) => {
  //   // определяет комнату
  //   const posArr = pos.split('');
  //   // some logic
  //   const unique_name = historyObj.unique_name + posArr.join('');
  //   return ''+unique_name;
  // }
  // const strRouteFunc = "({historyObj, pos}) => {\n    // определяет комнату\n    const posArr = pos.split('');\n    // some logic\n    const unique_name = historyObj.unique_name + posArr.join('');\n    return ''+unique_name;\n  }"
  // const dataStrFunc = `var posArr = pos.split(''); var resName = unique_name + posArr.join('');`;
  
  vm.runInContext(historyObj.routeFunc, historyObj)
  log('context', historyObj.pos);
  // служебная часть кода
  // работа с комнатами
  const unique_name = historyObj.resName;
  let workRoom = await Room.findOne({unique_name}).populate(['members']);
  if(workRoom) {
    // сохранение исходного workRoom
    // не проверки на то, состоит ли уже юзер в ней или нет
    if(!workRoom.members.some((id) => ''+id === ''+userData._id)) {
      workRoom.members = [...workRoom.members, userData._id];
    }
  } else {
    // генерация нового workRoom
    workRoom = Room({
      unique_name,
      historyId: historyObj._id,
      members: [userData._id]
    })
  }
  await workRoom.save();
  cLog("success save workRoom");

  // работа с MyRoom
  let newMyRoomObj = null;
  const myRoomObj = findAndReturn(userData.myRooms, '_id', workRoom._id);
  if(myRoomObj) {
    // What?
    cLog('alreadey in');
  } else {
     newMyRoomObj = MyRoom({
      user_id: userData._id,
      room_id: workRoom._id,
      visible: true,
      notification: true,
      history_id: historyObj._id,
    });
    await newMyRoomObj.save();
    userData.myRooms = [...userData.myRooms, newMyRoomObj._id];
    await userData.save();
    cLog("success save newMyRoomObj");
  }
  return {workRoom, newMyRoomObj: myRoomObj ? myRoomObj : newMyRoomObj}
}

const getMyRoomObj = (myRooms, usersMyRooms) => {
  let resInd = -1;
  for(let i = 0; i < myRooms.length; i++) {
    const checkId = ''+myRooms[i];
    for(let k = 0; k < usersMyRooms.length; k++) {
      if(''+usersMyRooms[k]._id === checkId) {
        resInd = k;
      }
    }
  }
  if(resInd > -1) {
    return usersMyRooms[resInd];
  } else {
    return null;
  }
}

const prepareEndPointStr = ({roomData, userData, usersMyRooms = []}) => {
  const notificationArr = [];

  const meUserId = ''+ userData._id;
  let resArr = ["Участники группу:\n"];
  roomData.members.forEach(({_id, username, first_name, myRooms }) => {
    // myRooms - id от myRoom
    // необходимо вытащить нужный id из myRooms, который есть в usersMyRooms и вернуть myRoomObj
    if(meUserId != ''+_id) {

      // необходимо определить нужный myRoom
      const userMyRoomObj = getMyRoomObj(myRooms, usersMyRooms);
      if(userMyRoomObj) {
        if(userMyRoomObj.visible) {
          resArr.push(`[${first_name}](https://t.me/${username})\n`);
        }
        if(userMyRoomObj.notification) {
          notificationArr.push(userMyRoomObj.user_id);
        }
      }
    }
  })
  if(resArr.length === 1) {
    resArr[0] = `В группе пока нет участников\nВам придет уведомление, когда кто то появится\n`;
  }
  return {str: resArr.join(''), noti: notificationArr};
}

module.exports = {
  debug, 
  debugSome, 
  findAndReturn, 
  checkMessageRouter, 
  prepareKeyboard,
  endPointHandler,
  prepareEndPointStr
}