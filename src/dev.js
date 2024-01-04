const { debug } = require('./helpers');

const log = console.log;

function mainDev({userData, message, bot}) {
  log('alive dev', message);
  const kmPerPoint = 77.19679703554965;
  let {latitude: x, longitude: y} = message.location;
  x = 56.796115783128045;
  y = 60.58112550443904;  
  const xT = 56.82406624049435;
  const yT = 60.50543395498395;

  const diag = Math.sqrt(Math.pow(x-xT, 2)+Math.pow(y-yT,2));
  console.log('km to mega: ', diag*kmPerPoint);

}

module.exports = {
  mainDev
}