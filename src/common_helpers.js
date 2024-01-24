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


module.exports = {
  getPhotoName,
  likesUpdate
}