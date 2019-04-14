const express = require('express');
const bodyParser = require('body-parser');
const env = require('node-env-file');

env(__dirname + '/.env');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/webhook', (req, res) => {

  // Токен верификации. Он должен быть строкой, состоящей из случайных символов
  let VERIFY_TOKEN = "MY_BOT";

  // Разбор параметров запроса
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Проверка, имеются ли в запросе mode и token
  if (mode && token) {

    // Проверка правильности mode и token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Отправка токена challenge из запроса
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Отправка ответа '403 Forbidden' если верифицировать токен не удалось
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {

  let { body }= req;

  if (body.object !== 'page') {
    res.sendStatus(404);
    return;
  }


  body.entry.forEach((entry) => {

    let webhook_event = entry.messaging[0];
    let sender_psid = webhook_event.sender.id;

    res.status(200).send('EVENT_RECEIVED' + webhook_event.message.text);

  });

});

app.listen(3000, () => console.log(`Server start on port: ${process.env.PORT}`));
