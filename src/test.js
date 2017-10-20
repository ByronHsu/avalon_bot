const { Avalon, 
  OPENING_A_ROOM,
  WAITING_PLAYERS_TO_JOIN,
  ARTHOR_ASSIGNING,
  ALL_VOTING,
  PLAYER_EXECUTING,
  ASSASSINATING,
  TEAM_EVIL_WIN } = require('./Avalon');


const control = new Avalon(5, {id: 0, name: 'test'});

control.changeRoomName('roommmmm')

setTimeout(function() {
  console.log('add: ', control.addUser({id: 1, name: 'test1'}));
  console.log('add: ', control.addUser({id: 2, name: 'test2'}));
  console.log('add: ', control.addUser({id: 3, name: 'test3'}));
  console.log('add: ', control.addUser({id: 4, name: 'test4'}));
}, 10);

setTimeout(async () => {
  const v = await control.showAllPlayers();
  console.log('v: ', v);
}, 20);


setTimeout(function() {
  console.log(control.getInitialInfo(0));
}, 30);

setTimeout(function() {
  console.log(control.getArthorInfo)
}, 40);

setTimeout(function() {
  console.log(control.assign([0, 1]));
}, 50);

setTimeout(function() {
  console.log(control.getAssignInfo);
}, 60);

setTimeout(function() {
  console.log(control.vote(0, 'yes'));
}, 70);

setTimeout(function() {
  console.log(control.vote(1, 'no'));
}, 80);

setTimeout(function() {
  console.log(control.vote(2, 'no'));
}, 90);

setTimeout(function() {
  console.log(control.vote(3, 'yes'));
}, 100);

setTimeout(function() {
  console.log(control.vote(4, 'yes'));
}, 110);

setTimeout(async function() {
  const a = await control.getVotingResult();
  console.log('result: ', a);
}, 115);

setTimeout(function() {
  console.log(control.exec(0, 'sus'));
}, 120);

setTimeout(function() {
  console.log(control.exec(1, 'fail'));
}, 130);

setTimeout(function() {
  console.log(control.getArthorInfo);
}, 140);