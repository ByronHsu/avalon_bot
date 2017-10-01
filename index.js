require('babel-register');

const { LineBot, LineHandlerBuilder} = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express');

const config = {
  channelSecret: '0525fb3fce50812fcef7199e427e31fe',
  accessToken: 'nny9zy8dQR14GiUD3YUG2R/1DnObcLhkt+4KeuXBGcsX+scNDtzwy77syMcFWs5csAz0v6t6eVg36KpayHQf/HWb4C8sWnVSU6aJK3XE70jS0ecUXupnkWFcL3CEJKOFHUzV5VAYJ3cUOVDuEc2sAQdB04t89/1O/w1cDnyilFU=',
};

const bot = new LineBot({
  channelSecret: config.channelSecret,
  accessToken: config.accessToken,
});

const handler = new LineHandlerBuilder()
  .onText(/yo/i, async context => {
    await context.sendText('Hi there!');
  })
  .onEvent(async context => {
    await context.sendText("I don't know what you say.");
  })
  .onError(async context => {
    await context.sendText('Something wrong happened.');
  })
  .build();

bot.onEvent(handler);

const server = createServer(bot);

const port = 5000 || process.env.PORT;

server.listen(port, () => {
  console.log('server is running on 5000 port...');
});
