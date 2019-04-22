const axios = require('axios');

const FACEBOOK_API_URL = 'https://graph.facebook.com/v2.6/me';
const {
  PAGE_TOKEN,
  BEST_BUY_API_KEY,
} = process.env;

const bby = require('bestbuy')(BEST_BUY_API_KEY);

module.exports = {
  async sendMessage(recipientId, msgText, quickRepliesBtns = null) {
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
  },

  async sendList(recipientId, products, favourites = false, viewMore = false) {
    const data = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [],
          },
        },
      },
    };

    if (favourites) {
      for (const product of products) {
        data.message.attachment.payload.elements.push(
          {
            title: product.name,
            image_url: product.image,
            default_action: {
              type: 'web_url',
              url: product.image,
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: product.image,
            },
            buttons: [
              {
                type: 'postback',
                title: 'View more',
                payload: `VIEW_MORE:${product.sku}`,
              },
              {
                type: 'postback',
                title: 'Buy',
                payload: `BUY:${product.sku}`,
              },
            ],
          },
        );
      }
    } else if (viewMore) {
      for (const product of products) {
        data.message.attachment.payload.elements.push(
          {
            title: product.name,
            image_url: product.image,
            default_action: {
              type: 'web_url',
              url: product.image,
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: product.image,
            },
            buttons: [
              {
                type: 'postback',
                title: 'Add to favourites',
                payload: `ADD_TO_FAVOURITES:${product.sku}`,
              },
              {
                type: 'postback',
                title: 'Buy',
                payload: `BUY:${product.sku}`,
              },
            ],
          },
        );
      }
    } else {
      for (const product of products) {
        data.message.attachment.payload.elements.push(
          {
            title: product.name,
            image_url: product.image,
            default_action: {
              type: 'web_url',
              url: product.image,
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: product.image,
            },
            buttons: [
              {
                type: 'postback',
                title: 'View more',
                payload: `VIEW_MORE:${product.sku}`,
              },
            ],
          },
        );
      }
    }

    if (data.message.attachment.payload.elements.length > 10) {
      // eslint-disable-next-line
      data.message.attachment.payload.elements.splice(0, data.message.attachment.payload.elements.length - 10);
      data.message.attachment.payload.elements.reverse();
    }

    return axios.post(`${FACEBOOK_API_URL}/messages?access_token=${PAGE_TOKEN}`, data);
  },

  async getProducts() {
    try {
      const products = await bby.products('type=Movie', {
        show: 'image,name,sku',
        page: 1,
        pageSize: 7,
      });
      return products.products;
    } catch (e) {
      console.error('error', e);
      return e;
    }
  },

  async getProductById(id) {
    try {
      const products = await bby.products(`sku=${id}`, { show: 'plot,name,sku,image' });
      return products.products;
    } catch (e) {
      console.error(e);
      return e;
    }
  },

  MAIN_MENU_BTN: [
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
  ],
  LOCATION: [
    {
      content_type: 'location',
    },
  ],
  PHONE: [
    {
      content_type: 'user_phone_number',
    },
  ],
};
