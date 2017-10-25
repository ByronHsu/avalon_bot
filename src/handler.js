const fs = require('fs');
const { MessengerHandler } = require('toolbot-core-experiment');
const { Avalon, OPENING_A_ROOM, WAITING_PLAYERS_TO_JOIN, ARTHOR_ASSIGNING,
  ALL_VOTING, PLAYER_EXECUTING, ASSASSINATING, TEAM_EVIL_WIN } = require('./Avalon');

var utils = require('./utils');

var playerLimit;
var player = 1;
var users = [];
var state = 0;
var arthor = 0;
var round = 0;
var voteFailCount = 0;
var assignedPlayer = [];
var playerHasVoted = [];
var result = [0, 0, 0, 0, 0];

let avalonRooms = [];
let allUsers = [];

async function initArthor(){
  arthor = (arthor+1)%playerLimit;
  users.map((user)=>{
    user.client.sendText(user.id,
    `${users[arthor].name} is Arthor now.This round he needs to pick ${utils.pick[playerLimit - 5][round]} players`)});
  let str = '';
  str = `Pick ${utils.pick[playerLimit - 5][round]} by id.\nid name`;
  await Promise.all(users.map(async (u, i) => { str = str + `\n${i}:  ${u.name}`; }));
  users[arthor].client.sendText(users[arthor].id, str);
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
        user.client.sendText(user.id, 'Team good wins. Time to assassinate.');
        if (user.character === 'Assassin') {
          let str = '';
          str = `Pick ${utils.pick[round]} by id.\nid name`;
          await Promise.all(users.map(async (u, i) => { await str += `\n${i}:  ${u.name}`; }));
          user.client.sendText(user.id, str);
        }
      });
      state = 5;
    } else {
      let str = '';
      await Promise.all(users.map(async (u, i) => { str += `\n${u.name} is ${u.character}`}));
      users.map(user => {
        user.client.sendText(user.id, `Team evil wins. ${str}`);
      });
      setTimeout(() => init(), 10000);
    }
  } else {
    initArthor();
  }
}

function init() {
  player = 1;
  users = [];
  state = 0;
  arthor = 0;
  round = 0;
  voteFailCount = 0;
  assignedPlayer = [];
  playerHasVoted = [];
  result = [0, 0, 0, 0, 0];
}

function parseAssign(room, userId, context) {
  if (room.getState === ARTHOR_ASSIGNING && userId === room.getArthor.id) {
    const arr = context._event.message.text.split(' ');
    const returnState = room.assign(arr);
    if (returnState === ARTHOR_ASSIGNING) {
      context.sendText(`Pick ${room.pickMissionPlayers} by id.\nid name\n${room.showAllPlayers}`);
      return false;
    } else if (returnState === ALL_VOTING) {
      room.getUserList.map( async user => {
        await user.client.sendQuickReplies({ text: room.getAssignInfo }, [
          {
            content_type: 'text',
            title: 'Yes',
            payload: `VOTE_yes`,
          },
          {
            content_type: 'text',
            title: 'No',
            payload: `VOTE_no`,
          }
        ]);
      });
      return true;
    }
  }
  return false;
}

function checkVoteExec(room, userId, msg) {
  if (room.getState === ALL_VOTING) {
    room.getUserList.map(user => {
      if (user.id !== userId && !room.isActionDone(user.id)) {
        user.client.sendQuickReplies(user.id, { text: `${user.id === userId ? '' : msg }` }, [
          {
            content_type: 'text',
            title: 'Yes',
            payload: `VOTE_yes`,
          },
          {
            content_type: 'text',
            title: 'No',
            payload: `VOTE_no`,
          }
        ]);
      } else if (user.id !== userId) {
        user.client.sendText(user.id `${msg}`);
      }
    });
    return true;
  } else if (room.getState === PLAYER_EXECUTING) {
    room.getUserList.map(user => {
      if (!room.isActionDone(user.id)) {
        user.client.sendQuickReplies(user.id, { text: `${user.id === userId ? '' : msg }` }, [
          {
            content_type: 'text',
            title: 'Success',
            payload: `EXEC_sus`,
          },
          {
            content_type: 'text',
            title: 'Fail',
            payload: `EXEC_fail`,
          }
        ]);
      } else if (user.id !== userId) {
        user.client.sendText(user.id `${msg}`);
      }
    });
    return true;
  }
  return false;
}

module.exports = new MessengerHandler()

.onPayload(/JOIN_A_ROOM/, async context => {
  const sendArr = [];
  avalonRooms.map((room, index) => {
    if (room.getState === WAITING_PLAYERS_TO_JOIN) {
      sendArr.push({
        content_type: 'text',
        title: room.getRoomName,
        payload: `JOINING_${index}`,
      });
    }
  });
  await context.sendQuickReplies({ text: 'Choose a room:' }, sendArr);
})
.onPayload(/JOINING_\d+/, async context => {
  const roomIndex = context._event.payload.match(/\d+/)[0];
  const currRoom = avalonRooms[roomIndex];
  console.log(currRoom.getRoomName);
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const returnState = currRoom.addUser({ id: currentUserId, name: currentUserName, client: currentClient });
  if (returnState === WAITING_PLAYERS_TO_JOIN) {
    allUsers.push({ id: currentUserId, roomIndex: roomIndex });
    currRoom.getUserList.map( async user => {
      await user.client.sendText( user.id,
        `${currentUserName} joined. Wait for ${currRoom.getPlayerLimit - currRoom.getNumberOfPlayers} players to start!`);
    })
  } else if (returnState === ARTHOR_ASSIGNING) {
    allUsers.push({ id: currentUserId, roomIndex: roomIndex });
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText( user.id,
        `${currentUserName} joined. Game Starts!!\n${curroom.getInitialInfo(user)}`);
      await user.client.sendText( user.id,
        `${curroom.getArthorInfo}`);
    }));
    await currRoom.getArthor.client.sendText(currRoom.getArthor.id, `Pick ${currRoom.pickMissionPlayers} by id.\nid name\n${currRoom.showAllPlayers}`);
  } else {
    await context.sendQuickReplies({ text: 'The room is full. Create a room or Join a room: ' }, [
      {
        content_type: 'text',
        title: 'Join a room',
        payload: 'JOIN_A_ROOM',
      },
      {
        content_type: 'text',
        title: 'Create a room',
        payload: 'CREATE_A_NEW_ROOM',
      }
    ]);
  }
})
.onPayload('CREATE_A_NEW_ROOM', async context => {
  let arr = [];
  for (let i = 5; i < 11; i ++) {
    arr.push({
      content_type: 'text',
      title: `${i}`,
      payload: `CREATE_A_NEW_ROOM_${i}`,
    });
  }
  await context.sendQuickReplies({ text: 'How many players:' }, arr);
})
.onPayload(/CREATE_A_NEW_ROOM_\d+/, async context => {
  const playerLimit = context._event.payload.match(/\d+/)[0];
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const roomIndex = avalonRooms.length;
  avalonRooms.push(new Avalon(playerLimit, { id: currentUserId, name: currentUserName, client: currentClient }));
  allUsers.push({ id: currentUserId, roomIndex: roomIndex });
  await context.sendText(`What's you room name?`);
})
.onPayload(/VOTE_/, async context => {
  const vote = context._event.payload.split('_')[1];
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const currUser = allUsers.find(u => u.id === currentUserId);
  const currRoom = avalonRooms[currUser.roomIndex];
  const returnState = currRoom.vote(currentUserId, vote);
  await context.sendText(`You voted ${vote}.`)
  if (returnState === ARTHOR_ASSIGNING) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `${currRoom.getVotingResult}.\nThe team is rejected.`);
    }));
  } else if (returnState === PLAYER_EXECUTING) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `${currRoom.getVotingResult}.\nThe team is approved. Quest starts.`);
    }));
    await Promise.all(currRoom.getAssignedPlayer.map( async user => {
      await user.client.sendQuickReplies(user.id, { text: `Quest Success or Fail?` }, [
        {
          content_type: 'text',
          title: 'Success',
          payload: `EXEC_sus`,
        },
        {
          content_type: 'text',
          title: 'Fail',
          payload: `EXEC_fail`,
        }
      ]);
    }))
  }
})
.onPayload(/EXEC_/, async context => {
  const exec = context._event.payload.split('_')[1];
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const currUser = allUsers.find(u => u.id === currentUserId);
  const currRoom = avalonRooms[currUser.roomIndex];
  const [returnState, result] = currRoom.exec(currentUserId, exec);
  await context.sendText(`You choose ${exec}.`)
  if (returnState === ARTHOR_ASSIGNING) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `Quest ${result === 1 ? 'succeeded' : 'failed'}.\n${currRoom.getResultDetail}`);
      await user.client.sendText(user.id, `${curroom.getArthorInfo}`);
    }));
    await currRoom.getArthor.client.sendText(currRoom.getArthor.id, `Pick ${currRoom.pickMissionPlayers} by id.\nid name\n${currRoom.showAllPlayers}`);
  } else if (returnState === TEAM_EVIL_WIN) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `Quest ${result === 1 ? 'succeeded' : 'failed'}.\n${currRoom.getResultDetail}`);
      await user.client.sendText(user.id, `Team evil wins.\n${currRoom.showPlayersDetails}`);
    }));
  }
})
// old //
//
//
//
.onText(/-open \d+/, async context => {
  if(state === 0){
    init();
    console.log(context.client);
    let tmp = /\d+/;
    const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
    playerLimit = parseInt(context._event.message.text.match(tmp)[0]);
    await context.sendText(`You create a room!!`);
    users.push({ id: currentUserId, name: currentUserName, client: currentClient });
    state = 1;
    console.log('a room is created ', playerLimit);
  }
})
.onText(/-join/i, async context => {
  console.log('join ');
  if(state === 1){
    let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.first_name,context._client];
    console.log(currentUserId,currentUserName);
    if(utils.isIdExist(users,currentUserId) === false){
      users.push({id:currentUserId,name:currentUserName,client:currentClient});

      await context.sendText(`wait for ${playerLimit - ++player} players to start!`);
      console.log('now: ', player);
      if (player === playerLimit) { //game 喔喔
        state = 2;
        utils.allocate(users);
        // broadcast game start and all the players and characters.
        users.map( (user) => {
          user.client.sendText(user.id, `You are ${user.character} of team ${utils.isGood(user) ? 'good' : 'evil'}.`);
          user.client.sendText(user.id, utils.getInfo(user, users));
        })
        initArthor();
      }
    }else{
      await context.sendText(`You are already in the room!!`);
    }
  }
})
.onText(/-assign \d+/, async context => {
  if(state === 2){
    console.log('ass ok');
    const tempArr = context._event.message.text.split(' ').splice(1);
    for (let i = 0; i < tempArr.length; i++) {
      assignedPlayer[i] = { id: users[tempArr[i]].id };
    }
    if(assignedPlayer.length === utils.pick[playerLimit - 5][round]){
      state = 3;
      let str = 'Arthor chose';
      tempArr.map(id => str += ` ${users[id].name}`)
      users.map(async user => {
        user.client.sendText(user.id, `${str}. Vote yes or no`);
      });
    }else{
      await context.sendText(`You need to pick ${utils.pick[playerLimit - 5][round]} players!!`);
    }
  }
})
.onText(/-vote/, async context => {
  if(state === 3){
    let vote = context._event.message.text.split(' ')[1];
    console.log('vote: ', vote);
    if(!utils.isIdExist(playerHasVoted,context._session.user.id)){
      console.log('no exist');
      playerHasVoted.push({id:context._session.user.id,vote});
      if(playerHasVoted.length === playerLimit){
        let yesCount = 0;
        for(let i = 0;i < playerLimit;i++){
          if(playerHasVoted[i].vote === 'yes') yesCount++;
        }
        if(yesCount > playerLimit-yesCount){
          playerHasVoted = [];
          state = 4;
          users.map((user) => { user.client.pushText(user.id ,'');});
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
.onText(/-exec/, async context => {
   if (state === 4) {
    const exe = context._event.message.text.split(' ')[1];
    if (utils.isIdExist(assignedPlayer, context._session.user.id) && !utils.isIdExist(playerHasVoted, context._session.user.id)) {
      if (exe === 'sus') {
        assignedPlayer.splice(assignedPlayer.findIndex(u => u.id === context._session.user.id), 1);
      } else if (exe === 'fail') {
        playerHasVoted.push({ id: context._session.user.id });
      } else {
        await context.sendText('You need to type sus or fail!!');
      }
      if (assignedPlayer.length === playerHasVoted.length) {
        if (playerHasVoted.length > 0 && (playerLimit < 7 || round !== 3)) {
          users.map(user => { user.client.sendText(user.id, `${playerHasVoted.length} players failed. Mission failed.`) });
          missionEnd(0);
        } else if (playerHasVoted.length < 2) {
          users.map(user => { user.client.sendText(user.id, `1 player failed, but mission success.`) });
          missionEnd(1)
        } else {
          users.map(user => { user.client.sendText(user.id, `Mission success.`) });
          missionEnd(1);
        }
      }
    } else {
      await context.sendText(`You cannot execute!!`);
    }
   }
})
.onText(/-kill/, async context => {
  if (state === 5) {
    const index = context._event.message.text.split(' ')[1];
    let str = '';
    await Promise.all(users.map(async (u, i) => { str += `\n${u.name} is ${u.character}`}));
    users.map(user => {
      user.client.sendText(user.id, `Team ${users[index].character === 'Merlin' ? 'evil' : 'good'} wins. ${str}`);
    });
    setTimeout(() => init(), 10000);
  }
})
.onText(/-b/, async context => { //廣播 ex:-b msg
  let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.first_name,context._client];
  let msg = context._event.message.text.replace(/-b\s/,"");
  console.log('broadcast: ', msg)
  users.map((user)=>{ if(user.id != currentUserId) user.client.sendText(user.id ,`${currentUserName} : ${msg}`);});
})
.onText(async context => {
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const currUser = allUsers.find(u => u.id === currentUserId);
  const msg = context._event.message.text;
  if (!context._event.isEcho && currUser) {
    const currRoom = avalonRooms[currUser.roomIndex];
    if (currRoom.changeRoomName(context._event.message.text)) {
      await context.sendText(`You created a room named ${context._event.message.text}!!`);
    } else if (!parseAssign(currRoom, currentUserId, context) && !checkVoteExec(currRoom, currentUserId, `${currentUserName}: ${msg}`)) {
      currRoom.getUserList.map(user => {
        if (user.id !== currentUserId) user.client.sendText(user.id, `${currentUserName}: ${msg}`);
      });
    }
  } else if (!context._event.isEcho) {
    await context.sendQuickReplies({ text: 'Create a room or Join a room: ' }, [
      {
        content_type: 'text',
        title: 'Join a room',
        payload: 'JOIN_A_ROOM',
      },
      {
        content_type: 'text',
        title: 'Create a room',
        payload: 'CREATE_A_NEW_ROOM',
      }
    ]);
  }
})
.onError(async context => {
  // await context.sendText('Something wrong happened.');
  console.log('error');
})
.build();
