const mongoose = require('mongoose');

const { Schema } = mongoose;

const userPurchase = new Schema({
  userId: Number,
  products: [],
});

module.exports = mongoose.model('UserPurchase', userPurchase);
