exports.allocate = (users)=>{
    let data = [['Merlin', 'Percival', 'ServantOfArthor1', 'Morcana', 'Assassin'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin', 'Oberon'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'Morcana', 'Assassin', 'MinionOfMordred'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Mordred'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Oberon', 'Mordred']];
    let cardDeck = data[arr.length-5].sort((a, b) => 0.5 - Math.random());
    for (let i = 0; i < users.length; i++) {
        users[i].character = cardDeck[i];
    }
}
exports.isIdExist = (arr,id)=>{
    for(let i=0;i<arr.length;i++){
        if(arr[i].id == id) return true;
    }
    return false;
}
