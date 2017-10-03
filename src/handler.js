const { LineHandlerBuilder} = require('toolbot-core-experiment');
var utils = require('./utils');
var people = 0;
var users = [];

async function allocate() {
  let cardDeck = await utils.shuffle(require('./data')[people - 5]);
  for (let i = 0; i < users.length; i++) {
    users[i].character = cardDeck[i];
  }
}

module.exports = new LineHandlerBuilder()
.onText('-j', async context => {
  
  var currentUserId = context._session.user.id;
  var currentClient = context._client;

  if(utils.isIdExist(users,currentUserId) == false){
    users.push({id:currentUserId});
    await context.pushText(`wait for ${7 - ++people} people to start!`);
    if(people === 7){
      users.map((user)=>{currentClient[`pushText`](user.id ,'fuck!');});
    }
  }

})
.onError(async context => {
  await context.sendText('Something wrong happened.');
})
.build();



