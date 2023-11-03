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


module.exports = {debug, debugSome}