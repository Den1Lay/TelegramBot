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

module.exports = {
  debug, 
  debugSome, 
  findAndReturn, 
  checkMessageRouter, 
  prepareKeyboard
}