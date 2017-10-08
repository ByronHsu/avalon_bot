# Structure
## State = 0 
- Definition: waiting for someone to create a room
- Command
    - ```-open < (number of players) >```
        - create a new game 
- Details
    - number of players is between 5 to 10
    - once the cmd is called it'll move to next state
## State = 1 
- Definition: add new players until the room is full
- Command
    - ```-join``` 
        - join the existing game
- Details
    - once the room is full,bot'll send message inform everyone. 
## State = 2
- Definition: 雅瑟王指派任務
- Command 
    - ```-assign <(player)...>```
- Details
    - bot randomly selects the Author first
    - once the cmd is called it'll move to next state
## State = 3
- Definition: 眾人投票決定任務是否能通過
- Command
    - ```-vote < yes|no >```
- Details
    - pass => state4
    - not pass => state2
## State = 4
- Definition: 被指派的人開始出任務
- Command
    - ```-exec < sus|fail >```
- Details

## State = 5
- Definition: 刺客現身刺殺梅林
- Command
    -```-kill <player>```