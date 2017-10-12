const fs = require('fs');
const { LineHandlerBuilder } = require('toolbot-core-experiment');
var utils = require('./utils');

var playerLimit;
var player = 6;
var users = [];
var state = 0;
var arthor = 0;
var round = 0;
var voteFailCount = 0;
var assignedPlayer = [];
var playerHasVoted = [];
var result = [0, 0, 0, 0, 0];

async function initArthor(){
  arthor = (arthor+1)%playerLimit;
  users.map((user)=>{
    user.client[`pushText`](user.id,
    `${users[arthor].name} is Arthor now.This round he needs to pick ${utils.pick[playerLimit - 5][round]} players`)});
  let str = ''
  str = `Pick ${utils.pick[playerLimit - 5][round]} by id.\nid name`;
  await Promise.all(users.map(async (u, i) => { str = str + `\n${i}:  ${u.name}`; }));
  users[arthor].client.pushText(users[arthor].id, str);
}

async function missionEnd(m) {
  voteFailCount = 0;
  result[round++] = m;
  assignedPlayer = [];
  playerHasVoted = [];
  if (round > 4) {
    let count = 0;
    result.map(r => count += r);
    if (count >= 3) {
      users.map(async user => {
        user.client.pushText(user.id, 'Team good wins. Time to assassinate.');
        if (user.character === 'Assassin') {
          let str = '';
          str = `Pick ${utils.pick[round]} by id.\nid name`;
          await Promise.all(users.map(async (u, i) => { await str += `\n${i}:  ${u.name}`; }));
          user.client.pushText(user.id, str);
        }
      });
      state = 5;
    } else {
      let str = '';
      await Promise.all(users.map(async (u, i) => { str += `\n${u.name} is ${u.character}`}));
      users.map(user => {
        user.client.pushText(user.id, `Team evil wins. ${str}`);
      });
      setTimeout(() => init(), 10000);
    }
  } else {
    initArthor();
  }
}

function init() {
  users = [];
  state = 0;
  arthor = 0;
  round = 0;
  voteFailCount = 0;
  assignedPlayer = [];
  playerHasVoted = [];
  result = [0, 0, 0, 0, 0];
}

module.exports = new LineHandlerBuilder()

.onText(/-open \d+/, async context => {
  if(state === 0){
    init();
    let tmp = /\d+/;
    const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.displayName, context._client];
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
    await context.pushText(`You create a room!!`);
    users.push({ id: currentUserId, name: currentUserName, client: currentClient });
    state = 1;
  }
})

.onText(/-join/, async context => {
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
          user.client[`pushText`](user.id, `You are ${user.character} of team ${utils.isGood(user) ? 'good' : 'evil'}.`);
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
    assignedPlayer = context._event.message.text.split(' ').splice(1);
    for (let i = 0; i < assignedPlayer.length; i++) {
      assignedPlayer[i] = { id: users[assignedPlayer[i]].id };
    }
    if(assignedPlayer.length === utils.pick[playerLimit - 5][round]){
      state = 3;
    }else{
      await context.pushText(`You need to pick ${utils.pick[playerLimit - 5][round]} players!!`);
    }
  }
})
.onText(/-vote/, async context => {
  if(state === 3){
    let vote = context._event.message.text.split(' ').splice(1);
    if(!isIdExist(playerHasVoted,context._session.user.id)){
      playerHasVoted.push({id:context._session.user.id,context,vote});
      if(playerHasVoted.size() === playerLimit){
        let yesCount = 0;
        for(let i = 0;i < playerLimit;i++){
          if(playerHasVoted[i].vote === 'yes') yesCount++;
        }
        if(yesCount > playerLimit-yesCount){
          playerHasVoted = [];
          state = 4;
          users.map((user) => { user.client.pushText(user.id ,);});
        }else{
          playerHasVoted = [];
          state = 2;
          if (++voteFailCount > 4) missionEnd(0);
          initArthor();
        }
      }
    }
  }
})
.onText(/-exec/, async contexxt => {
   if (state === 4) {
    const exe = context._event.message.text.split(' ')[1];
    if (isIdExist(assignedPlayer, context._session.user.id) && !isIdExist(playerHasVoted, context._session.user.id)) {
      if (exe === 'sus') {
        assignedPlayer.splice(assignedPlayer.findIndex(u => u.id === context._session.user.id), 1);
      } else if (exe === 'fail') {
        playerHasVoted.push({ id: context._session.user.id });
      } else {
        await context.pushText('You need to type sus or fail!!');
      }
      if (assignedPlayer.length === playerHasVoted.length) {
        if (playerHasVoted.length > 0 && (playerLimit < 7 || round !== 3)) {
          users.map(user => { user._client.pushText(user.id, `${playerHasVoted.length} players failed. Mission failed.`) });
          missionEnd(0);
        } else if (playerHasVoted.length < 2) {
          users.map(user => { user._client.pushText(user.id, `1 player failed, but mission success.`) });
          missionEnd(1)
        } else {
          users.map(user => { user._client.pushText(user.id, `Mission success.`) });
          missionEnd(1);
        }
      }
    } else {
      await context.pushText(`You cannot execute!!`);
    }
   }
})
.onText(/-kill/, async context => {
  if (state === 5) {
    const index = context._event.message.text.split(' ')[1];
    let str = '';
    await Promise.all(users.map(async (u, i) => { str += `\n${u.name} is ${u.character}`}));
    users.map(user => {
      user.client.pushText(user.id, `Team ${users[index].character === 'Merlin' ? 'evil' : 'good'} wins. ${str}`);
    });
    setTimeout(() => init(), 10000);
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
