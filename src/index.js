var handler = require('./handler');
require('babel-register');

const { MessengerBot, MessengerHandler } = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  accessToken: 'EAAauUy0W8R0BAF8Dl75xhDwiR30QtZBKrySBmaXpes4QwBfNigoNrPGDZBxRhJcKBqZAF18NpeZAlfIh2TrcsggkYtstJs2587Fv569mhZAVZCEJnSbi1eGRZBuVkVCQOn0RIUTmhZA8eycyQkR8rvCfy4foZCsjNq4R0qOrlJxSeyeZA8M5HN8LnH',
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

