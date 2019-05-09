const {
  VERIFY_TOKEN,
} = process.env;

module.exports = {
  async index(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('WEBHOOK_VERIFIED');
          return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }
  },
};
