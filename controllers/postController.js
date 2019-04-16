const
  {
    sendMessage,
    sendList,
    getProducts,
    getProductById,
    MAIN_MENU_BTN,
  } = require('../helpers');
const UserFavourites = require('../models/UserFavourites');
// const UserPurchase = require('../models/UserPurchase');


module.exports = {
  async index(req, res) {
    try {
      const { body } = req;

      if (body.object !== 'page') {
        res.sendStatus(404);
        return;
      }

      body.entry.forEach(async (entry) => {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;

        if (webhookEvent.message) {
          if (webhookEvent.message.quick_reply) {
            switch (webhookEvent.message.quick_reply.payload) {
              case 'OPEN_MAIN_MENU':
                await sendMessage(senderPsid, 'Hello, I\'m your main menu!');
                return res.status(200).send('Click to "Open main menu button"');
              case 'OPEN_SHOP':
                // eslint-disable-next-line
                const products = await getProducts();
                try {
                  await sendList(senderPsid, products);
                } catch (e) {
                  console.error(e.response.data);
                }
                return res.status(200).send(products);
              case 'OPEN_FAVOURITES':
                try {
                  await UserFavourites.findOne(
                    { userId: +senderPsid },
                    (err, favourites) => {
                      if (err) return console.error(err);

                      sendList(+senderPsid, favourites.products, true);
                    },
                  );
                  return res.status(200).send({
                    message: 'Favourites',
                  });
                } catch (e) {
                  console.error('error', e);
                }
                break;
              default:
                await sendMessage(senderPsid, 'Under construction');
                return res.status(200).send('');
            }
          }
          return res.status(200).send(`Message: ${webhookEvent.message.text}`);
        }

        if (webhookEvent.postback) {
          const PAYLOAD_NAME_INDEX = 0;
          let payload = [webhookEvent.postback.payload];

          if (payload[PAYLOAD_NAME_INDEX].indexOf(':') !== -1) {
            payload = payload[PAYLOAD_NAME_INDEX].split(':');
          }

          switch (payload[PAYLOAD_NAME_INDEX]) {
            case 'GET_STARTED':
              await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
              return res.status(200).send('Get start btn clicked');
            case 'MAIN_MENU_PAYLOAD':
              await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
              return res.status(200).send('Main menu opened');
            case 'ADD_TO_FAVOURITES':
              const productById = await getProductById(payload[1]);

              const userFavoritesModel = await UserFavourites.findOne(
                { userId: senderPsid },
                err => console.error(err),
              );

              if (!userFavoritesModel) {
                await UserFavourites.create(
                  {
                    userId: senderPsid,
                    products: [...productById],
                  },
                  err => console.error(err),
                );

                console.log(UserFavourites);
                return res.status(200).send({
                  message: 'Add to favourites',
                });
              }

              // console.log('userFavoritesModel.products', userFavoritesModel.products);

              const product = userFavoritesModel.products.find(_product => +_product.sku === +payload[1]);
              if (!product) {
                await UserFavourites.updateOne(
                  { userId: senderPsid },
                  { $push: { products: productById } },
                );
              }

              return res.status(200).send({
                message: 'Add to favourites',
              });
              // break;
            default:
              return res.status(200).send('Otherwise');
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  },
};
