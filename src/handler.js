const fs = require('fs');
const { LineHandlerBuilder} = require('toolbot-core-experiment');
var utils = require('./utils');

var playerLimit;
var player = 0;
var users = [];
var state = 0;
var arthor = 0;
var game = 0;
var gameData = [3,4,4,5,5]

function runMission(){
  users.map((user)=>{user.client[`pushText`](user.id ,`Now ${users[arthor].name} is Arthor`);});
  users[arthor].client[`pushText`](users[arthor].client.id , `You need to pick ${gameData[game]} players`);
  arthor++;game++;
  state = 2;
}

function broadCast(msg,except){
  users.map((user)=>{user.client[`pushText`](user.id ,msg)});
}

module.exports = new LineHandlerBuilder()
.onText(/-open \d+/, async context => {
  if(state === 0){ //等待開房間
    let tmp = /\d+/;
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
    await context.pushText(`You create a room!!`);
    state = 1;
  }
})
.onText('-j', async context => {
  if(state === 1){ //大家開始加入
    let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.displayName,context._client];


    if(utils.isIdExist(users,currentUserId) == false){
      users.push({id:currentUserId,name:currentUserName,client:currentClient});


      await context.pushText(`wait for ${playerLimit - ++player} players to start!`);
      
      if (player === playerLimit) { // game 喔喔
        state = 2;
        utils.allocate(users);
        // broadcast game start and all the players and characters.
        users.map(user => {
          user.client.pushText(user.id, `You are ${user.character} of team ${utils.isGood(user) ? good : evil}.`);
          user.client.pushText(user.id, utils.getInfo(user, users));
        })

      }

    }else{
      await context.pushText(`You are already in the room!!`);
    }
  }
})
.onText(/-b/, async context => { //廣播 ex:-b msg
  let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.displayName,context._client];
  let msg = context._event.message.text.replace(/-b\s/,"");
  broadCast(`${currentUserName} : ${msg}`);
  //users.map((user)=>{user.client[`pushText`](user.id ,`${currentUserName} : ${msg}`);});
})
.onError(async context => {
  await context.sendText('Something wrong happened.');
})
.build();




