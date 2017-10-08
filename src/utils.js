exports.isGood = (user)=>{
    if (['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4'].includes(user.character)) {
        return true;
    }
    return false;
}
exports.getInfo = (user, users)=>{
    let str = '';
    if (user.character === 'Merlin') {
        str += 'These are the bad guys:';
        users.map(u => {
            if (!isGood(u) && u.character !== 'Mordred') {
                str += `\n${u.name}`;
            }
        });
    } else if (user.character === 'Percival') {
        const temp = users.filter(u => u.character === 'Merlin' || u.character === 'Morcana');
        str += `Either ${temp[0].name} or ${temp[1].name} is Merlin.`;
    } else if (!isGood(user) && user.character !== 'Oberon') {
        str += 'These are the bad guys:';
        users.map(u => {
            if (!isGood(u) && u.character !== 'Oberon') {
                str += `\n${u.name}`
            }
        });
    } else {
        str = 'You know nothing.'
    }
    return str;
}

exports.isIdExist = (arr,id)=>{
    for(let i=0;i<arr.length;i++){
        if(arr[i].id == id) return true;
    }
    return false;
}

exports.allocate = (users)=>{
    var data = [['Merlin', 'Percival', 'ServantOfArthor1', 'Morcana', 'Assassin'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin', 'Oberon'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'Morcana', 'Assassin', 'MinionOfMordred'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Mordred'],
    ['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Oberon', 'Mordred']];
    var cardDeck = data[users.length - 5].sort((a, b) => 0.5 - Math.random());
    users.map((u, i) => { u.character = cardDeck[i]; });
}

exports.gameData = {
    pick : [3,4,4,5,5],
}