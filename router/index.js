const getController = require('../controllers/getController');
const postController = require('../controllers/postController');

module.exports = (app) => {
  app.get('/', (req, res) => res.send('Hello World!'));
  app.get('/webhook', getController.index);
  app.post('/webhook', postController.index);
};
