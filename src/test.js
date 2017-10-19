const {Avalon} = require('./Avalon');

console.log(Avalon.isGood({character : 'Merlin'}))

const control = new Avalon(5, {id: 0, name: 'test'});

control.showAllPlayers().then( v => console.log('v ', v) );

console.log('haha');