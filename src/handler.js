const fs = require('fs');
const { LineHandlerBuilder } = require('toolbot-core-experiment');
var utils = require('./utils');

var playerLimit;
var player = 6;
var users = [];
var state = 0;
var arthor = 0;
var round = 0;
var assignedPlayer = [];
var playerHasVoted = [];

function initArthor(){
  arthor = (arthor+1)%playerLimit;
  users.map((user)=>{user.client[`pushText`](user.id,
    `${users[arthor].name} is Arthor now.This round he needs to pick ${utils.pick[round]} players`)});
}

module.exports = new LineHandlerBuilder()

.onText(/-open \d+/, async context => {
  if(state === 0){ 
    let tmp = /\d+/;
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
    await context.pushText(`You create a room!!`);
    state = 1;
  }
})

.onText('-join', async context => {
  if(state === 1){
    let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.displayName,context._client];

    if(utils.isIdExist(users,currentUserId) == false){
      users.push({id:currentUserId,name:currentUserName,client:currentClient});

      await context.pushText(`wait for ${playerLimit - ++player} players to start!`);
      
      if (player === playerLimit) { //game 喔喔
        state = 2;
        utils.allocate(users);
        // broadcast game start and all the players and characters.
        users.map( (user) => {
          user.client[`pushText`](user.id, `You are ${user.character} of team ${utils.isGood(user) ? good : evil}.`);
          user.client[`pushText`](user.id, utils.getInfo(user, users));
        })
        initArthor();
      }
    }else{
      await context.pushText(`You are already in the room!!`);
    }
  }
})
.onText(/-assign/, async context => {
  if(state === 2){
    assignedPlayer = context._event.message.text.split(' ').splice(0,1);
    if(assignedPlayer.size() === utils.pick[round]){
      state = 3;
    }else{
      await context.pushText(`You need to pick ${utils.pick[round]} players!!`);
    }
  }
})
.onText(/-vote/, async context => {
  if(state === 3){
    let vote = context._event.message.text.split(' ').splice(0,1);
    if(!isIdExist(playerHasVoted,context._session.user.id)){
      playerHasVoted.push({id:context._session.user.id,context,vote});
    }
    if(playerHasVoted.size() === playerLimit){
      let yesCount = 0;
      for(let i = 0;i < playerLimit;i++){
        if(playerHasVoted[i].vote === 'yes') yesCount++;
      }
      if(yesCount > playerLimit-yesCount){
        state = 4;
      }else{
        state = 2;
        initArthor();
      }
    }
  }
})
.onText(/-exec/, async contexxt => {
   if(state === 4){

   }
})
.onText(/-b/, async context => { //廣播 ex:-b msg
  let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.displayName,context._client];
  let msg = context._event.message.text.replace(/-b\s/,"");
  users.map((user)=>{ if(user.id != currentUserId) user.client[`pushText`](user.id ,`${currentUserName} : ${msg}`);});
})
.onError(async context => {
  await context.sendText('Something wrong happened.');
})
.build();




