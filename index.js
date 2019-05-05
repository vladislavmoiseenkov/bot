const express = require('express');
const bodyParser = require('body-parser');
const env = require('node-env-file');
const mongoose = require('mongoose');
// eslint-disable-next-line
env(__dirname + '/.env');

const {
  PORT,
  DB_USER,
  DB_PASSWORD,
} = process.env;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0-2jba9.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connect success');
  // db.collections['userfavourites'].deleteMany({});
  // console.log('db.collections', db.collections['userfavourites']);
});

const app = express();

app.set('PORT', PORT);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./router')(app);

app.listen(app.get('PORT'), () => console.log(`Server start on port: ${PORT}`));
