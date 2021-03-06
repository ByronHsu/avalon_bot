const fs = require('fs');
const { MessengerHandler } = require('toolbot-core-experiment');
const { Avalon, OPENING_A_ROOM, WAITING_PLAYERS_TO_JOIN, ARTHOR_ASSIGNING,
  ALL_VOTING, PLAYER_EXECUTING, ASSASSINATING, TEAM_GOOD_WIN, TEAM_EVIL_WIN } = require('./Avalon');


let avalonRooms = [];
let allUsers = [];

const sendExecQuickReply = [
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
];

const sendVoteQuickReply = [
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
];

const sendGreeting = [
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
];

function parseAssign(room, userId, context) {
  if (room.getState === ARTHOR_ASSIGNING && userId === room.getArthor.id) {
    const arr = context._event.message.text.split(' ').filter( a => a !== '');
    const returnState = room.assign(arr);
    if (returnState === ARTHOR_ASSIGNING) {
      context.sendText(`Pick ${room.pickMissionPlayers} by id.\nid name\n${room.showAllPlayers}`);
      return false;
    } else if (returnState === ALL_VOTING) {
      room.getUserList.map( async user => {
        await user.client.sendQuickReplies(user.id, { text: room.getAssignInfo }, sendVoteQuickReply);
      });
      return true;
    }
  }
  return false;
}

function checkVoteExec(room, userId, msg) {
  if (room.getState === ALL_VOTING) {
    room.getUserList.map(user => {
      if (!room.isActionDone(user.id)) {
        user.client.sendQuickReplies(user.id, { text: `${user.id === userId ? 'Vote yes or no.' : msg }` }, sendVoteQuickReply);
      } else if (user.id !== userId) {
        user.client.sendText(user.id, `${msg}`);
      } else {
        user.client.markSeen(user.id);
      }
    });
    return true;
  } else if (room.getState === PLAYER_EXECUTING) {
    room.getUserList.map(user => {
      if (!room.isActionDone(user.id)) {
        const sendArr = Avalon.isGood(user) ? [sendExecQuickReply[0]] : sendExecQuickReply
        user.client.sendQuickReplies(user.id, { text: `${user.id === userId ? 'Quest Success or Fail?' : msg }` },
          Avalon.isGood(user) ? [sendExecQuickReply[0]] : sendExecQuickReply);
      } else if (user.id !== userId) {
        user.client.sendText(user.id, `${msg}`);
      } else {
        user.client.markSeen(user.id);
      }
    });
    return true;
  }
  return false;
}

function dismissRoom(roomIndex) {
  avalonRooms[roomIndex].getUserList.map(user => {
    user.client.sendText(user.id, 'The room is dismissed.');
    allUsers.splice(allUsers.findIndex(u => u.id === user.id), 1);
  });
  delete avalonRooms[roomIndex];
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
  if (sendArr.length > 0) {
    await context.sendQuickReplies({ text: 'Choose a room:' }, sendArr);
  } else {
    await context.sendQuickReplies({ text: 'No room available. Create a room or Join a room: ' }, sendGreeting);
  }
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
        `${currentUserName} joined. Game Starts!!`);
      await user.client.sendImage( user.id,
        fs.createReadStream(`../assets/${user.character}.jpg`));
      await user.client.sendText( user.id,
        `${currRoom.getInitialInfo(user)}`);
      await user.client.sendText( user.id,
        `${currRoom.getArthorInfo}`);
    }));
    await currRoom.getArthor.client.sendImage(currRoom.getArthor.id, fs.createReadStream(`../assets/Arthor.jpg`));
    await currRoom.getArthor.client.sendText(currRoom.getArthor.id, `You are arthor now.\nPick ${currRoom.pickMissionPlayers} by id.\nid name${currRoom.showAllPlayers}`);
  } else {
    await context.sendQuickReplies({ text: 'The room is full. Create a room or Join a room: ' }, sendGreeting);
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
  const playerLimit = Number(context._event.payload.match(/\d+/)[0]);
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
      await user.client.sendText(user.id, `${currRoom.getVotingResult}\nThe team is rejected.`);
      await user.client.sendText(user.id, `${currRoom.getArthorInfo}`);
    }));
    await currRoom.getArthor.client.sendText(currRoom.getArthor.id, `Pick ${currRoom.pickMissionPlayers} by id.\nid name\n${currRoom.showAllPlayers}`);
  } else if (returnState === PLAYER_EXECUTING) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `${currRoom.getVotingResult}\nThe team is approved. Quest starts.`);
    }));
    await Promise.all(currRoom.getAssignedPlayer.map( async user => {
      await user.client.sendQuickReplies(user.id, { text: `Quest Success or Fail?` }, 
        Avalon.isGood(user) ? [sendExecQuickReply[0]] : sendExecQuickReply);
    }))
  } else if (returnState === TEAM_EVIL_WIN) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `Team evil wins.\n${currRoom.showPlayersDetail}`);
    }));
    dismissRoom(currUser.roomIndex);
  }
})
.onPayload(/EXEC_/, async context => {
  const exec = context._event.payload.split('_')[1];
  const [currentUserId, currentUserName, currentClient] = [context._session.user.id, context._session.user.first_name, context._client];
  const currUser = allUsers.find(u => u.id === currentUserId);
  const currRoom = avalonRooms[currUser.roomIndex];
  const [returnState, result] = currRoom.exec(currentUserId, exec);
  await context.sendText(`You choose ${exec === 'sus' ? 'Success' : 'Fail'}.`)
  if (returnState === ARTHOR_ASSIGNING) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `Quest ${result === 1 ? 'succeeded' : 'failed'}.\n${currRoom.getResultDetail}`);
      await user.client.sendText(user.id, `${currRoom.getArthorInfo}`);
    }));
    await currRoom.getArthor.client.sendText(currRoom.getArthor.id, `Pick ${currRoom.pickMissionPlayers} by id.\nid name\n${currRoom.showAllPlayers}`);
  } else if (returnState === TEAM_EVIL_WIN) {
    await Promise.all(currRoom.getUserList.map( async user => {
      await user.client.sendText(user.id, `Quest ${result === 1 ? 'succeeded' : 'failed'}.\n${currRoom.getResultDetail}`);
      await user.client.sendText(user.id, `Team evil wins.\n${currRoom.showPlayersDetail}`);
      dismissRoom(currUser.roomIndex);
    }));
  } else if (returnState === ASSASSINATING) {
    const sendArr = currRoom.getUserList.filter(u => u.id !== currRoom.getAssassin.id).map(u => {
      return {
        content_type: 'text',
        title: `${u.name}`,
        payload: `ASSASSINATE_${u.id}`,
      }
    });
    currRoom.getAssassin.client.sendQuickReplies(currRoom.getAssassin.id, { text: 'Choose a person to assassinate.' }, sendArr);
  }
})
.onPayload(/ASSASSINATE_/, async context => {
  const assassinatedUserId = context._event.payload.split('_')[1];
  const currUser = allUsers.find(u => u.id === context._session.user.id);
  const currRoom = avalonRooms[currUser.roomIndex];
  const returnState = currRoom.assassinate(assassinatedUserId);
  await Promise.all(currRoom.getUserList.map( async user => {
    await user.client.sendText(user.id, `Assassin assassinated ${currRoom.getUserById(u.id).name}.`);
    await user.client.sendText(user.id, `Team ${returnState === TEAM_GOOD_WIN ? 'good' : 'evil'} wins.\n${currRoom.showPlayersDetail}`);
    dismissRoom(currUser.roomIndex);
  }));
})
.onText(/-b/, async context => { //廣播 ex:-b msg
  let [currentUserId,currentUserName,currentClient] = [context._session.user.id,context._session.user.first_name,context._client];
  let msg = context._event.message.text.replace(/-b\s/,"");
  // console.log('broadcast: ', msg)
  avalonRooms.map( currRoom => {
    currRoom.getUserList.map( user => {
      if(user.id != currentUserId) user.client.sendText(user.id ,`BROADCAST\n${currentUserName} : ${msg}`);
    })
  })
})
.onText(/--reset/, async context => {
  avalonRooms = [];
  allUsers = [];
  await context.sendText('All reset.');
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
        if (user.id !== currentUserId) {
          user.client.sendText(user.id, `${currentUserName}: ${msg}`);
        } else {
          user.client.markSeen(user.id);
        }
      });
    }
  } else if (!context._event.isEcho) {
    await context.sendQuickReplies({ text: 'Create a room or Join a room: ' }, sendGreeting);
  }
})
.onError(async context => {
  // await context.sendText('Something wrong happened.');
  console.log('error');
})
.build();
