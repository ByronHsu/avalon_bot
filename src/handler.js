const fs = require('fs');
const { LineClient } = require('messaging-api-line');
const { LineHandlerBuilder} = require('toolbot-core-experiment');
var utils = require('./utils');

var playerLimit;
var player = 0;
var users = [];
var state = 0;

function mission(){
  
}

module.exports = new LineHandlerBuilder()
.onText(/-open \d+/, async context => {
  if(state === 0){ //等待開房間
    let tmp = /\d+/;
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
    state = 1;
  }
})
.onText('-j', async context => {
  if(state === 1){ //大家開始加入
    var currentUserId = context._session.user.id;
    var currentUserName = context._session.user.id;
    var currentClient = context._client;

    if(utils.isIdExist(users,currentUserId) == false){
      users.push({id:currentUserId,name:currentUserName,client:currentClient});

      await context.pushText(`wait for ${playerLimit - ++player} players to start!`);
      
      if (player === playerLimit) { // game 喔喔
        state = 2;
        utils.allocate(users);
        // broadcast game start and all the players and characters.
        users.map(user => {
          LineClient.pushText(user.id, `You are ${user.character} of team ${utils.isGood(user) ? good : evil}.`);
          LineClient.pushText(user.id, utils.getInfo(user, users));
        })
      }

    }else{
      context.pushText(`You are already in the room!!`);
    }
  }
})
.onError(async context => {
  await context.sendText('Something wrong happened.');
})
.build();




