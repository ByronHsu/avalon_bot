var handler = require('./handler');
require('babel-register');

const { MessengerBot, MessengerHandler } = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  accessToken: 'EAAauUy0W8R0BAPIYFUtymBgw6xGAJjZCxOliHr5XdnUyVRWYuuyuAvZCb0ZBlplLXl6oYsZBXoPdLWqBqZArk0da1pOtsUlQ9vtcHSdJeYrhHZCdhnK6iSSniCb4aY4RpZB1ghwVR7lM8lBGf1LTDWyXF1BZCZB2L9yJvj2KhrDvhyA06Wul5dDIX',
  appSecret: 'b8cb5001fa774db5b530dfbb9f359b22',
};

const bot = new MessengerBot({
  accessToken: config.accessToken,
  appSecret: config.appSecret,
});

bot.onEvent(handler);

const server = createServer(bot);

const port = 5000;

server.listen(port, () => {
  console.log('server is running on 5000 port...');
});

