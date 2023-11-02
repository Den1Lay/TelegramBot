const mongoose = require('mongoose');

const debug = (obj={}) => {
  return JSON.stringify(obj, null, 4);
}

const kittySchema = new mongoose.Schema({
  name: String
});
kittySchema.methods.speak = function speak() {
  const greeting = this.name
    ? 'File name is ' + this.name
    : "File without name";
  console.log(greeting);
  return greeting;
};


const Kitten = mongoose.model('Kitten', kittySchema);



module.exports = {debug, Kitten}