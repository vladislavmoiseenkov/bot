const mongoose = require('mongoose');

const { Schema } = mongoose.Schema;

const userPurchase = new Schema({
  userId: Schema.ObjectId,
  products: [],
});

mongoose.model('UserPurchase', userPurchase);
