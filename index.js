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
  let VERIFY_TOKEN = "e1793c25a0ccbdcebd704af009c98b6c";

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

  let body = req.body;

  console.log(0);
  if (body.object === 'page') {
    console.log(1);

    //Перебор объектов, которых может быть несколько при пакетной передаче данных
    body.entry.forEach(function(entry) {

      // сущность entry.messaging является массивом, но
      // тут будет лишь одно сообщение, поэтому используется индекс 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Получение PSID отправителя
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Проверка события, выяснение того, message это или postback,
      // и передача события подходящей функции-обработчику
      if (webhook_event.message) {
        console.log(webhook_event.message)
      } else if (webhook_event.postback) {
        console.log(webhook_event.postback)
      }
    });

    // Возврат '200 OK' в ответ на все запросы
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Возврат '404 Not Found', если событие не относится к тем, на которые мы подписаны
    res.sendStatus(422);
  }

});

app.listen(3000, () => console.log(`Server start on port: ${process.env.PORT}`));
