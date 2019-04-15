const express = require('express');
const bodyParser = require('body-parser');
const env = require('node-env-file');
const axios = require('axios');

env(__dirname + '/.env');

const FACEBOOK_API_URL = 'https://graph.facebook.com/v2.6/me';
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT;

const MAIN_MENU_BTN = [
  {
    content_type: 'text',
    title: 'My purchases',
    payload: 'OPEN_PURCHASES',
  },
  {
    content_type: 'text',
    title: 'Shop',
    payload: 'OPEN_SHOP',
  },
  {
    content_type: 'text',
    title: 'Favourites',
    payload: 'OPEN_FAVOURITES',
  },
  {
    content_type: 'text',
    title: 'To invite a friend',
    payload: 'INVITE_FRIEND',
  },
];

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/webhook', (req, res) => {

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

  body.entry.forEach(async (entry) => {

    let webhook_event = entry.messaging[0];
    let sender_psid = webhook_event.sender.id;

    if (webhook_event.message) {
      if (webhook_event.message.quick_reply) {
        switch (webhook_event.message.quick_reply.payload) {
          case 'OPEN_MAIN_MENU':
            await sendMessage(sender_psid, 'Hello, I\'m your main menu!');
            return res.status(200).send('Click to "Open main menu button"');
        }
      }
      return res.status(200).send('Message: ' + webhook_event.message.text);
    }

    if (webhook_event.postback) {

      switch (webhook_event.postback.payload) {
        case 'GET_STARTED':
          await sendMessage(sender_psid, 'Main menu', MAIN_MENU_BTN);
          return res.status(200).send('Get start btn clicked');
        case 'MAIN_MENU_PAYLOAD':
          await sendMessage(sender_psid, 'Main menu', MAIN_MENU_BTN);
          return res.status(200).send('Main menu opened');
        default:
          return res.status(200).send('Otherwise');

      }
    }

  });

});

app.listen(PORT, () => console.log(`Server start on port: ${PORT}`));



async function sendMessage(recipientId, msgText, quickRepliesBtns = null) {
  const data = {
    recipient:{
      id: recipientId
    },
    message: {
      text: msgText
    }
  };

  if (quickRepliesBtns) {
    data.message.quick_replies = quickRepliesBtns;
  }

  return axios.post(`${FACEBOOK_API_URL}/messages?access_token=${PAGE_TOKEN}`, data);
}
