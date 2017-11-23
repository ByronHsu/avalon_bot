var handler = require('./handler');
require('babel-register');

const { MessengerBot, MessengerHandler } = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  accessToken: 'EAAauUy0W8R0BAJpqLj8RvJR42ZAKERDLtBhU5Anah3KB59pKXVhZAmlqFv8zN9tngkhJRT1b4giZAXZAmiVnQTl8UZBtwpZAHWLZACkLcBGZAbvOrSlWoZCVBGrjAgIZAJGhSIpBH52efklAxjpLCiReeZAEGwzYw7mN9ImBW0urwtZB1akHiZByKqv98',
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

