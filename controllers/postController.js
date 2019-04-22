const
  {
    sendMessage,
    sendList,
    getProducts,
    getProductById,
    MAIN_MENU_BTN,
    LOCATION,
    PHONE,
  } = require('../helpers');
const UserFavourites = require('../models/UserFavourites');
const UserPurchase = require('../models/UserPurchase');


module.exports = {
  async index(req, res) {
    try {
      const { body } = req;
      let phoneNumber;

      if (body.object !== 'page') {
        res.sendStatus(404);
        return;
      }

      body.entry.forEach(async (entry) => {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;

        if (webhookEvent.message) {
          if (webhookEvent.message.quick_reply) {
            // eslint-disable-next-line
            const phoneRe = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;

            if (phoneRe.test(webhookEvent.message.quick_reply.payload)) {
              phoneNumber = webhookEvent.message.quick_reply.payload;
              webhookEvent.message.quick_reply.payload = 'PHONE';
            }

            switch (webhookEvent.message.quick_reply.payload) {
              case 'OPEN_MAIN_MENU':
                await sendMessage(senderPsid, 'Hello, I\'m your main menu!');
                return res.status(200).send('Click to "Open main menu button"');
              case 'OPEN_SHOP':
                try {
                // eslint-disable-next-line
                  const products = await getProducts();
                  await sendList(senderPsid, products);
                  return res.status(200).send(products);
                } catch (e) {
                  console.error(e.response.data);
                }
                break;
              case 'OPEN_FAVOURITES':
                try {
                  await UserFavourites.findOne(
                    { userId: +senderPsid },
                    (err, favourites) => {
                      if (err) return console.error(err);

                      if (!favourites) {
                        return res.status(200).send({
                          message: 'Favourites',
                        });
                      }

                      sendList(+senderPsid, favourites.products, true);
                    },
                  );
                  return res.status(200).send({
                    message: 'Favourites',
                  });
                } catch (e) {
                  console.error('error', e);
                  return res.status(500).send({
                    message: e,
                  });
                }
              case 'PHONE':
                try {
                  const lastUserPurchase = await UserPurchase.findOne(
                    { userId: senderPsid },
                  );

                  // eslint-disable-next-line
                  lastUserPurchase.products[lastUserPurchase.products.length - 1].phone = phoneNumber;
                  await UserPurchase.findOneAndUpdate(
                    { userId: senderPsid },
                    { $set: { products: lastUserPurchase.products } },
                  );

                  // eslint-disable-next-line
                  await sendMessage(senderPsid, 'Thank you! Please share you location for delivery', LOCATION);
                  return res.status(200).send({
                    phone: phoneNumber,
                  });
                } catch (e) {
                  console.error(e);
                  return res.status(500).send(e);
                }
              case 'OPEN_PURCHASES':
                try {
                  const userPurchase = await UserPurchase.findOne({ userId: senderPsid });

                  if (!userPurchase) {
                    await sendMessage(senderPsid, 'No items in purchase', null);
                  } else {
                    await sendList(senderPsid, userPurchase.products, false, false);
                  }

                  return res.status(200).send({ message: 'Purchases' });
                } catch (e) {
                  console.error(e);
                  return res.status(500).send(e);
                }
              default:
                await sendMessage(senderPsid, 'Under construction');
                return res.status(200).send('');
            }
          }

          if (webhookEvent.message.attachments) {
            // eslint-disable-next-line
            sendMessage(senderPsid, 'Our courier will contact you within 2 hours', null);
            return res.status(200).send({
              message: 'webhookEvent.message.attachment',
            });
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
              try {
                await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
                return res.status(200).send('Get start btn clicked');
              } catch (e) {
                console.error(e);
                return res.status(500).send(e);
              }
            case 'MAIN_MENU_PAYLOAD':
              try {
                await sendMessage(senderPsid, 'Main menu', MAIN_MENU_BTN);
                return res.status(200).send('Main menu opened');
              } catch (e) {
                console.error(e);
                return res.status(500).send(e);
              }
            case 'ADD_TO_FAVOURITES':
              // eslint-disable-next-line
              const productById = await getProductById(payload[1]);

              // eslint-disable-next-line
              const userFavoritesModel = await UserFavourites.findOne(
                { userId: senderPsid }, (err) => {
                  if (err) return console.log(err);
                },
              );

              if (!userFavoritesModel) {
                await UserFavourites.create(
                  {
                    userId: senderPsid,
                    products: [...productById],
                  }, (err) => {
                    if (err) return console.log(err);
                  },
                );

                await sendMessage(senderPsid, 'Added to favourites', MAIN_MENU_BTN);

                return res.status(200).send({
                  message: 'Add to favourites',
                });
              }


              // eslint-disable-next-line
              const product = userFavoritesModel.products.find(_product => +_product.sku === +payload[1]);
              if (!product) {
                await UserFavourites.updateOne(
                  { userId: senderPsid },
                  { $push: { products: productById } },
                );
              }

              await sendMessage(senderPsid, 'Added to favourites', MAIN_MENU_BTN);

              return res.status(200).send({
                message: 'Add to favourites',
              });
            case 'VIEW_MORE':
              try {
                // eslint-disable-next-line
                const viewProductById = await getProductById(payload[1]);

                await sendList(senderPsid, [...viewProductById], false, true);

                return res.status(200).send('View More');
              } catch (e) {
                console.error(e);
                return res.status(500).send(e);
              }
            case 'BUY':
              try {
                // eslint-disable-next-line
                const productById = await getProductById(payload[1]);

                // eslint-disable-next-line
                const userPurchaseModel = await UserPurchase.findOne(
                  { userId: senderPsid },
                  err => console.error(err),
                );

                if (!userPurchaseModel) {
                  await UserPurchase.create(
                    {
                      userId: senderPsid,
                      products: [...productById],
                    },
                    err => console.error(err),
                  );
                } else {
                  try {
                    await UserPurchase.updateOne(
                      { userId: senderPsid },
                      { $push: { products: productById } },
                    );
                  } catch (e) {
                    console.error('e', e);
                  }
                }

                await sendMessage(senderPsid, 'Share your phone number, please', PHONE);

                return res.status(200).send({
                  message: 'Bought',
                });
              } catch (e) {
                console.error(e);
                return res.status(500).send(e);
              }
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
