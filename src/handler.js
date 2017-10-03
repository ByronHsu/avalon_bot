const { LineHandlerBuilder} = require('toolbot-core-experiment');
var utils = require('./utils');

var playerLimit;
var player = 0;
var users = [];
var state;

module.exports = new LineHandlerBuilder()
.onText(/-open \d+/, async context => {
  if(state === 0){ //等待開房間
    let tmp = /\d+/;
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
  }
})
.onText('-j', async context => {
  if(state === 1){ //大家開始加入
    var currentUserId = context._session.user.id;
    var currentClient = context._client;

    if(utils.isIdExist(users,currentUserId) == false){

      users.push({id:currentUserId,client:currentClient});
      await context.pushText(`wait for ${playerLimit - ++player} player to start!`);
      if(player === playerLimit){
        users.map((user)=>{currentClient[`pushText`](user.id ,'profile');});
        state = 2;
      }
    }
  }
})
.onError(async context => {
  await context.sendText('Something wrong happened.');
})
.build();




