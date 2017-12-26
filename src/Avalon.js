const pick = [[2, 3, 2, 3, 3],
[2, 3, 4, 3, 4],
[2, 3, 3, 4, 4],
[3, 4, 4, 5, 5],
[3, 4, 4, 5, 5],
[3, 4, 4, 5, 5]];

const data = [['Merlin', 'Percival', 'ServantOfArthor1', 'Morcana', 'Assassin'],
['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin'],
['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'Morcana', 'Assassin', 'Oberon'],
['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'Morcana', 'Assassin', 'MinionOfMordred'],
['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Mordred'],
['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4', 'Morcana', 'Assassin', 'Oberon', 'Mordred']];

const OPENING_A_ROOM = 0;
const WAITING_PLAYERS_TO_JOIN = 1;
const ARTHOR_ASSIGNING = 2;
const ALL_VOTING = 3;
const PLAYER_EXECUTING = 4;
const ASSASSINATING = 5;
const TEAM_GOOD_WIN = 100;
const TEAM_EVIL_WIN = 101;

class Avalon {
  constructor(playerLimit, host) {
    this.playerLimit = playerLimit;
    this.roomName = '';
    this.users = [host];
    this.state = OPENING_A_ROOM;
    this.playerCount = 1;
    this.arthor = 0;
    this.round = 0;
    this.voteFailCount = 0;
    this.assignedPlayer = [];
    this.playerHasVoted = [];
    this.playerHasExedFail = [];
    this.result = [0, 0, 0, 0, 0];
  }
  static isIdExist(arr, id) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id == id) return true;
    }
    return false;
  }
  static isGood(user) {
    if (['Merlin', 'Percival', 'ServantOfArthor1', 'ServantOfArthor2', 'ServantOfArthor3', 'ServantOfArthor4'].includes(user.character)) {
      return true;
    } else {
      return false;
    }
  }
  get getResultCount(){
    let cnt = 0;
    this.result.forEach((u)=>{
      if(u === 1) cnt++;
    })
    return cnt;
  }
  get getResultDetail() {
    let str = `${this.playerHasExedFail.length} selected fail.\nCurrent result: `;
    for (let i = 0; i < 5; i++) {
      if (i < this.round && this.result[i] === 1) {
        str += 'o';
      } else if (i < this.round && this.result[i] === 0) {
        str += 'x';
      } else {
        str += `${pick[this.playerLimit - 5][i]}`;
      }
    }
    return str;
  }
  get getState(){
    return this.state;
  }
  get getRoomName() {
    return this.roomName;
  }
  get getNumberOfPlayers() {
    return this.users.length;
  }
  get getPlayerLimit() {
    return this.playerLimit
  }
  get getUserList() {
    return this.users;
  }
  get showAllPlayers() {
    let str = '';
    this.users.forEach((u, i) => {str = str + `\n${i}:  ${u.name} ${u.character}`;});
    return str;
  }
  get showPlayersDetail() {
    let str = '';
    this.users.forEach(u => {str = str + `\n${u.name} is ${u.character}`;});
    return str;
  }
  get pickMissionPlayers() {
    return pick[this.playerLimit - 5][this.round];
  }
  get getArthorInfo() {
    return `${this.users[this.arthor].name} is Arthor now. This round he/she needs to pick ${this.pickMissionPlayers} players`;
  }
  get getArthor() {
    return this.users[this.arthor];
  }
  get getAssassin() {
    return this.users.find(u => u.character === 'Assassin');
  }
  get getAssignInfo() {
    let str = 'Arthor chose';
    this.assignedPlayer.map(u => str += ` ${u.name},`)
    str += '.\nVote yes or no.'
    return str;
  }
  get getAssignedPlayer() {
    return this.assignedPlayer;
  }
  get getVotingResult() {
    let str = '';
    this.playerHasVoted.map(async u => str = str + `\n${this.getUserById(u.id).name} voted ${u.vote}`);
    str += `\nCurrent failed votes count: ${this.voteFailCount}.`;
    return str;
  }
  getInitialInfo(user) {
    let str = `You are ${user.character} of team ${Avalon.isGood(user) ? 'good' : 'evil'}.\nThere are ${this.playerLimit} characters:`;
    data[this.playerLimit - 5].map(item => str += `\n${item}`)
    // console.log('haha', data);
    // for (let i = 0; i < this.playerLimit; i += 1) {
    //   str += `\n${data[this.playerLimit - 5][i]}`;
    // }
    str += '\n----\n';
    if (user.character === 'Merlin') {
        str += 'These are the bad guys:';
        this.users.map(u => {
            if (!Avalon.isGood(u) && u.character !== 'Mordred') {
                str += `\n${u.name}`;
            }
        });
    } else if (user.character === 'Percival') {
        const temp = this.users.filter(u => u.character === 'Merlin' || u.character === 'Morcana');
        str += `Either ${temp[0].name} or ${temp[1].name} is Merlin.`;
    } else if (!Avalon.isGood(user) && user.character !== 'Oberon') {
        str += 'These are the bad guys:';
        this.users.map(u => {
          if (!Avalon.isGood(u) && u.character !== 'Oberon') {
            str += `\n${u.name}`
          }
        });
    } else {
        str += 'You know nothing.'
    }
    return str;
  }
  getUserById(id) {
    return this.users.find(u => u.id === id);
  }
  isActionDone(userId) {
    if (this.state === ALL_VOTING) {
      return Avalon.isIdExist(this.playerHasVoted, userId);
    } else if (this.state === PLAYER_EXECUTING) {
      return !Avalon.isIdExist(this.assignedPlayer, userId);
    }
    return -1;
  }
  _allocate() {
    // const cardDeck = data[this.playerLimit - 5].sort((a, b) => 0.5 - Math.random());
    const tempArr = data[this.playerLimit - 5].slice();
    for (let i = 0; i < this.playerLimit; i += 1) {
      const id = Math.floor(Math.random() * tempArr.length);
      this.users[i].character = tempArr.splice(id, 1)[0];
    }
  }
  changeRoomName(name) {
    if (this.state === OPENING_A_ROOM) {
      this.roomName = name;
      this.state = WAITING_PLAYERS_TO_JOIN;
      return true;
    } else {
      return false;
    }
  }
  assign(userArr) {
    if (this.state === ARTHOR_ASSIGNING) {
      for (let i = 0; i < userArr.length; i++) {
        if (Number.isInteger(Number(userArr[i])) && userArr[i] < this.getPlayerLimit && userArr[i] >= 0) {
          this.assignedPlayer[i] = this.users[userArr[i]];
        } else {
          this.assignedPlayer = [];
          return ARTHOR_ASSIGNING;
        }
      }
      if (this.assignedPlayer.length === this.pickMissionPlayers) {
        this.playerHasVoted = [];
        this.state = ALL_VOTING;
        return ALL_VOTING;
      } else {
        this.assignedPlayer = [];
        return ARTHOR_ASSIGNING;
      }
    }
    return -1;
  }
  vote(userId, vote) {
    if (this.state === ALL_VOTING) {
      if (vote !== 'yes' && vote !== 'no') {
        return -1;
      } else if (!Avalon.isIdExist(this.playerHasVoted, userId)) {
        this.playerHasVoted.push({ id: userId, vote });
        if (this.playerHasVoted.length === this.playerLimit) {
          let yesCount = 0;
          for (let i = 0; i < this.playerLimit; i++) {
            if (this.playerHasVoted[i].vote === 'yes') yesCount++;
          }
          if (yesCount > this.playerLimit - yesCount) {
            // this.playerHasVoted = [];
            this.playerHasExedFail = [];
            this.state = PLAYER_EXECUTING;
            return PLAYER_EXECUTING;
          } else if (++this.voteFailCount > 4) {
            return TEAM_EVIL_WIN;
          } else {
            // this.playerHasVoted = [];
            this.state = ARTHOR_ASSIGNING;
            this._initArthor();
            return ARTHOR_ASSIGNING;
          }
        }
        // console.log('debug: ', this.playerHasVoted);
        return ALL_VOTING;
      } else {
        console.log(userId, ' vote twice!!');
      }
    }
  }
  exec(userId, exe) {
    if (this.state === PLAYER_EXECUTING) {
      if (Avalon.isIdExist(this.assignedPlayer, userId) && !Avalon.isIdExist(this.playerHasExedFail, userId)) {
        if (exe === 'sus') {
          this.assignedPlayer.splice(this.assignedPlayer.findIndex(u => u.id === userId), 1);
        } else if (exe === 'fail') {
          this.playerHasExedFail.push({ id: userId });
        }
        if (this.assignedPlayer.length === this.playerHasExedFail.length) {
          if (this.playerHasExedFail.length > 0 && (this.playerLimit < 7 || this.round !== 3)) {
            return [this._missionEnd(0), 0];
          } else if (this.playerHasExedFail.length < 2) {
            return [this._missionEnd(1), 1];
          } else {
            return [this._missionEnd(0), 0];
          }
        } else {
          return [PLAYER_EXECUTING, null];
        }
      }
    }
  }
  assassinate(userId) {
    if (this.state === ASSASSINATING) {
      const user = this.getUserById(userId);
      if (user.character === 'Merlin') {
        return TEAM_EVIL_WIN;
      }
      return TEAM_GOOD_WIN
    }
  }
  addUser(user) {
    if (this.state === WAITING_PLAYERS_TO_JOIN) {
      if (!Avalon.isIdExist(this.users, user.id)) {
        this.users.push(user);
        this.playerCount += 1;
        if (this.playerCount === this.playerLimit) {
          this._allocate();
          this._initArthor();
          this.state = ARTHOR_ASSIGNING;
          return ARTHOR_ASSIGNING;
        } else {
          return WAITING_PLAYERS_TO_JOIN;
        }
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }
  initAll() {

  }
  _initArthor() {
    this.arthor = (this.arthor + 1) % this.playerLimit;
  }
  _missionEnd(m) {
    this.voteFailCount = 0;
    this.result[this.round++] = m;
    this.assignedPlayer = [];
    let count = 0;
    this.result.map(r => count += r);
    if (this.voteFailCount > 4) {
      this.state = TEAM_EVIL_WIN;
      return TEAM_EVIL_WIN;
    } else if (count >= 3) {
      this.state = ASSASSINATING;
      return ASSASSINATING;
    } else if (this.round - count >= 3) {
      this.state = TEAM_EVIL_WIN;
      return TEAM_EVIL_WIN;
    } else {
      this._initArthor();
      this.state = ARTHOR_ASSIGNING;
      return ARTHOR_ASSIGNING;
    }
  }
}

module.exports = { Avalon, 
  OPENING_A_ROOM,
  WAITING_PLAYERS_TO_JOIN,
  ARTHOR_ASSIGNING,
  ALL_VOTING,
  PLAYER_EXECUTING,
  ASSASSINATING,
  TEAM_EVIL_WIN,
  TEAM_GOOD_WIN };
