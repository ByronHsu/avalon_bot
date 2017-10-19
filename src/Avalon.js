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
    this.state = 0;
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
      if (arr.id === id) return true;
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
  get getUserList() {
    return this.users;
  }
  get showAllPlayers() {
    return (async () => {
      let str = '';
      await Promise.all(this.users.map(async (u, i) => { str = str + `\n${i}:  ${u.name}`; }));
      return str;
    });
  }
  get pickMissionPlayers() {
    return pick[this.playerLimit - 5][this.round];
  }
  get getInitialInfo() {
    let str = '';
    if (user.character === 'Merlin') {
        str += 'These are the bad guys:';
        this.users.map(u => {
            if (!Avalon.isGood(u) && u.character !== 'Mordred') {
                str += `\n${u.name}`;
            }
        });
    } else if (user.character === 'Percival') {
        const temp = users.filter(u => u.character === 'Merlin' || u.character === 'Morcana');
        str += `Either ${temp[0].name} or ${temp[1].name} is Merlin.`;
    } else if (!Avalon.isGood(user) && user.character !== 'Oberon') {
        str += 'These are the bad guys:';
        users.map(u => {
            if (!Avalon.isGood(u) && u.character !== 'Oberon') {
                str += `\n${u.name}`
            }
        });
    } else {
        str = 'You know nothing.'
    }
    return str;
  }
  _allocate() {
    const cardDeck = data[playerLimit - 5].sort((a, b) => 0.5 - Math.random());
    this.users.map((u, i) => { u.character = cardDeck[i]; });
  }
  assign(userArr) {
    if (this.state === ARTHOR_ASSIGNING) {
      for (let i = 0; i < userArr.length; i++) {
        this.assignedPlayer[i] = { id: users[tempArr[i]].id };
      }
      if (this.assignedPlayer.length === this.pickMissionPlayers()) {
        this.state = ALL_VOTING;
        return ALL_VOTING;
      } else {
        return ARTHOR_ASSIGNING;
      }
    }
  }
  vote(userId, vote) {
    if (this.state === ALL_VOTING) {
      if (!Avalon.isIdExist(this.users, userId)) {
        this.playerHasVoted.push({ id:context._session.user.id, vote });
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
            if (++this.voteFailCount > 4) this.missionEnd(0);
            this.initArthor();
            return ARTHOR_ASSIGNING;
          }
        }
        return ALL_VOTING;
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
            return [0, this.missionEnd(0)];
          } else if (this.playerHasVoted.length < 2) {
            return [0, this.missionEnd(1)];
          } else {
            return [0, this.missionEnd(1)];
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
          this.initArthor();
          this.state = ARTHOR_ASSIGNING;
          return ARTHOR_ASSIGNING;
        }
      } else {
        return -1;
      }
    }
  }
  initArthor() {
    this.arthor = (this.arthor + 1) % playerLimit;
  }
  async missionEnd(m) {
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
      initArthor();
      return ARTHOR_ASSIGNING;
    }
  }
}

module.exports.Avalon = Avalon;
