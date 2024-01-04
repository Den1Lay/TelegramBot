const axios = require('axios');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.listen(1111, async () => {
  console.log('load gen start');

  const url = 'https://tidy-hookworm-nationally.ngrok-free.app/bot6853001884:AAEndpONxl_M7gLjNyluvmKXeTgkmw0L82A'
  
  const data = fs.readFileSync(path.resolve(__dirname, 'load.json'));
  const pass = JSON.parse(data);
  console.log(pass);

  console.time()
  // for(let i = 0; i < 10_000; i++) {
  //   const req = await axios.post(url, pass);
  //   console.log(req.status);
  // }
  const regs = [
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    axios.post(url, pass),
    
  ];

  Promise.all(regs).then(() => {
    // console.log(req.status);
    console.timeEnd();
    process.exit();
  })
  
 

  // axios.post(url, );

  
})