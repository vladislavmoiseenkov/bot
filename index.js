const express = require('express');
const bodyParser = require('body-parser');
const env = require('node-env-file');
const axios = require('axios');

// eslint-disable-next-line
env(__dirname + '/.env');

const FACEBOOK_API_URL = 'https://graph.facebook.com/v2.6/me';
const { PAGE_TOKEN } = process.env;
const { VERIFY_TOKEN } = process.env;
const { PORT } = process.env;

async function sendMessage(recipientId, msgText, quickRepliesBtns = null) {
  const data = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: msgText,
    },
  };

  if (quickRepliesBtns) {
    data.message.quick_replies = quickRepliesBtns;
  }

  return axios.post(`${FACEBOOK_API_URL}/messages?access_token=${PAGE_TOKEN}`, data);
}

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
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

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
  const { body } = req;

  if (body.object !== 'page') {
    res.sendStatus(404);
    return;
  }

  // eslint-disable-next-line
  body.entry.forEach(async (entry) => {
    const webhookEvent = entry.messaging[0];
    const senderPsid = webhookEvent.sender.id;

    if (webhookEvent.message) {
      if (webhookEvent.message.quick_reply) {
        switch (webhookEvent.message.quick_reply.payload) {
          case 'OPEN_MAIN_MENU':
            await sendMessage(senderPsid, 'Hello, I\'m your main menu!');
            return res.status(200).send('Click to "Open main menu button"');
          default:
            await sendMessage(senderPsid, 'Hello, I\'m your main menu!');
            return res.status(200).send('');
        }
      }
      return res.status(200).send(`Message: ${webhookEvent.message.text}`);
    }

    if (webhookEvent.postback) {
      switch (webhookEvent.postback.payload) {
        case 'GET_STARTED':
          await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
          return res.status(200).send('Get start btn clicked');
        case 'MAIN_MENU_PAYLOAD':
          await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
          return res.status(200).send('Main menu opened');
        default:
          return res.status(200).send('Otherwise');
      }
    }
  });
});

app.listen(PORT, () => console.log(`Server start on port: ${PORT}`));
