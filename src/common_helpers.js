const getPhotoName = (fullPath) => {
  const fullLen = fullPath.length

  let i = 4;
  while(1) {
    if(fullPath[fullLen-1-i] === '\\') {
      break
    }
    i++;
  }
  
  return fullPath.slice(fullLen-i);
}


module.exports = {
  getPhotoName
}