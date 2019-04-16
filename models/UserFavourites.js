const mongoose = require('mongoose');

const { Schema } = mongoose;

const userFavourites = new Schema({
  userId: Number,
  products: Array,
});

module.exports = mongoose.model('UserFavourites', userFavourites);
