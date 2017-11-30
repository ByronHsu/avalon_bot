const { MessengerBot, MessengerHandler } = require('bottender');
const {createServer, handler} = require('./handler');
require('babel-register');

const config = {
  accessToken: 'EAAauUy0W8R0BAPIYFUtymBgw6xGAJjZCxOliHr5XdnUyVRWYuuyuAvZCb0ZBlplLXl6oYsZBXoPdLWqBqZArk0da1pOtsUlQ9vtcHSdJeYrhHZCdhnK6iSSniCb4aY4RpZB1ghwVR7lM8lBGf1LTDWyXF1BZCZB2L9yJvj2KhrDvhyA06Wul5dDIX',
  appSecret: 'b8cb5001fa774db5b530dfbb9f359b22',
};

// const config = require('./bottender.config.js').messenger;

const bot = new MessengerBot({
  accessToken: config.accessToken,
  appSecret: config.appSecret,
});

async function initBot() {
  await bot._connector._client.deleteMessengerProfile(['get_started', 'persistent_menu']);
  bot._connector._client.setWhitelistedDomains(['i.imgur.com', 'imgur.com', 'dereg666.github.io']);
  await bot._connector._client.setMessengerProfile({
    get_started: {
      payload: 'GET_STARTED',
    },
    composer_input_disabled: false,
    persistent_menu: [
      {
        locale: 'default',
        call_to_actions: [
          {
            type: 'postback',
            title: 'test',
            payload: 'WEBVIEW',
          },
        ],
      },
    ],
  })
  return bot;
}

initBot().then(() => {
  bot._connector._client.getMessengerProfile(['get_started', 'persistent_menu', 'whitelisted_domains']).then(profile => {
    console.log(profile);
  });
});

bot.onEvent(handler)

// setTimeout(function() {
//   console.log('bot: ', bot._connector._client.setMessengerProfile);
// }, 2000);

const server = createServer(bot);

const port = 5000;

server.listen(port, () => {
  console.log('server is running on 5000 port...');
});

