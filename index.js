require('babel-register');

const { LINEBot, LINEHandlerBuilder} = require('toolbot-core-experiment');
const { createServer } = require('toolbot-core-experiment/express')

const config = {
  channelSecret: '0525fb3fce50812fcef7199e427e31fe',
  accessToken: 'nny9zy8dQR14GiUD3YUG2R/1DnObcLhkt+4KeuXBGcsX+scNDtzwy77syMcFWs5csAz0v6t6eVg36KpayHQf/HWb4C8sWnVSU6aJK3XE70jS0ecUXupnkWFcL3CEJKOFHUzV5VAYJ3cUOVDuEc2sAQdB04t89/1O/w1cDnyilFU=',
};

const bot = new LINEBot({
  channelSecret: config.channelSecret,
  accessToken: config.accessToken,
});

const handler = new LINEHandlerBuilder()
  .onText(/yo/i, context => {
    context.sendText('Hi there!');
  })
  .onEvent(context => {
    context.sendText("I don't know what you say.");
  })
  .onError(context => {
    context.sendText('Something wrong happened.');
  })
  .build();

bot.onEvent(handler);

const server = createServer(bot);
server.listen(process.env.PORT||5000, () => {
  console.log('server is running on 5000 port...');
});