var handler = require('./handler');
require('babel-register');

const { MessengerBot, MessengerHandler } = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  accessToken: 'EAAauUy0W8R0BAPig8TCxZBF5ZCVtgHkKXbP60n2wSlJOpHuZCZA0YeYu1ZBjTbvDFqUTMS31rY97TOAE6FmyuE3KwDdwoun9F2lha9yc7H4ZBWY18jN2KNNG6Ou6Lb7RGq0dJZC7tl45u8DMZAVZCCfTiC0OZCPZCe32ZAq3avrJ30ckE4Q23nOOoQiX',
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

