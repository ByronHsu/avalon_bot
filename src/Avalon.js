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

const WAITING_PLAYERS_TO_JOIN = 1;
const ARTHOR_ASSIGNING = 2;
const ALL_VOTING = 3;
const PLAYER_EXECUTING = 4;
const ASSASSINATING = 5;
const TEAM_EVIL_WIN = 6;

class Avalon {
  constructor(playerLimit, host) {
    this.playerLimit = playerLimit;
    this.users = [host];
    this.state = WAITING_PLAYERS_TO_JOIN;
    this.playerCount = 1;
    this.arthor = 0;
    this.round = 0;
    this.voteFailCount = 0;
    this.assignedPlayer = [];
    this.playerHasVoted = [];
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
  get numberOfPlayers() {
    return this.playerLimit;
  }
  get getUserList() {
    return this.users;
  }
  get showAllPlayers() {
    let str = '';
    this.users.forEach((u, i) => {str = str + `\n${i}:  ${u.name}`;});
    return str;
  }
  get pickMissionPlayers() {
    return pick[this.playerLimit - 5][this.round];
  }
  get getArthorInfo() {
    return `${this.users[this.arthor].name} is Arthor now. This round he needs to pick ${this.pickMissionPlayers} players`;
  }
  get getArthor() {
    return this.arthor;
  }
  get getAssignInfo() {
    let str = 'Arthor chose';
    this.assignedPlayer.map(u => str += ` ${u.name}`)
    str += '. Vote yes or no.'
    return str;
  }
  get getAssignedPlayer() {
    return this.assignedPlayer;
  }
  getInitialInfo(index) {
    const user = this.users[index];
    let str = `You are ${user.character} of team ${Avalon.isGood(user) ? 'good' : 'evil'}.\n`;
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
  _allocate() {
    const cardDeck = data[this.playerLimit - 5].sort((a, b) => 0.5 - Math.random());
    this.users.map((u, i) => { u.character = cardDeck[i]; });
  }
  assign(userArr) {
    if (this.state === ARTHOR_ASSIGNING) {
      for (let i = 0; i < userArr.length; i++) {
        this.assignedPlayer[i] = this.users[userArr[i]];
      }
      if (this.assignedPlayer.length === this.pickMissionPlayers) {
        this.state = ALL_VOTING;
        return ALL_VOTING;
      } else {
        return ARTHOR_ASSIGNING;
      }
    }
  }
  vote(userId, vote) {
    if (this.state === ALL_VOTING) {
      if (!Avalon.isIdExist(this.playerHasVoted, userId)) {
        this.playerHasVoted.push({ id: userId, vote });
        if (this.playerHasVoted.length === this.playerLimit) {
          let yesCount = 0;
          for (let i = 0; i < this.playerLimit; i++) {
            if (this.playerHasVoted[i].vote === 'yes') yesCount++;
          }
          if (yesCount > this.playerLimit - yesCount) {
            this.playerHasVoted = [];
            this.state = PLAYER_EXECUTING;
            return PLAYER_EXECUTING;
          } else {
            this.playerHasVoted = [];
            this.state = ARTHOR_ASSIGNING;
            if (++this.voteFailCount > 4) this._missionEnd(0);
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
      if (Avalon.isIdExist(this.assignedPlayer, userId) && !Avalon.isIdExist(this.playerHasVoted, userId)) {
        if (exe === 'sus') {
          this.assignedPlayer.splice(this.assignedPlayer.findIndex(u => u.id === userId), 1);
        } else if (exe === 'fail') {
          this.playerHasVoted.push({ id: userId });
        }
        if (this.assignedPlayer.length === this.playerHasVoted.length) {
          if (this.playerHasVoted.length > 0 && (this.playerLimit < 7 || this.round !== 3)) {
            return [this._missionEnd(0), 0];
          } else if (this.playerHasVoted.length < 2) {
            return [this._missionEnd(1), 1];
          } else {
            return [this._missionEnd(1), 1];
          }
        } else {
          return [PLAYER_EXECUTING];
        }
      }
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
    }
  }
  _initArthor() {
    this.arthor = (this.arthor + 1) % this.playerLimit;
  }
  _missionEnd(m) {
    this.voteFailCount = 0;
    this.result[this.round++] = m;
    this.assignedPlayer = [];
    this.playerHasVoted = [];
    if (this.round > 4) {
      let count = 0;
      this.result.map(r => this.count += r);
      if (count >= 3) {
        return ASSASSINATING;
      } else {
        return TEAM_EVIL_WIN;
      }
    } else {
      this._initArthor();
      return ARTHOR_ASSIGNING;
    }
  }
}

module.exports = Avalon;
