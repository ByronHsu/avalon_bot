var handler = require('./handler');
require('babel-register');

const { MessengerBot, MessengerHandler } = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  accessToken: 'EAAauUy0W8R0BAAIXuApLGH4SKnMhmvaVGTxcloZCtraiOVC3of691C8RcLXO55xbXw7ZBFyUnfBJeyzeRlncJThNUVDn1MHIh968QUxGl1gG4qL7tLGkSWvYS1ZAY4Sww3H6EF3vsbbZA2ZAsCSXp17cuU6SaJ0aPNaTZAZC23s2G1QZBKL2AJKB',
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

