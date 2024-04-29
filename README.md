# Team B

# Game: Texas Hold'em

Team Members

| Name             | GitHub Name  |
| ---------------- | ------------ |
| Jake Klopukh     | jklopukh     |
| Varun Narravula  | water-sucks  |
| Dan Tahir        | DanTahir     |
| Anthony Benjamin | stackanthony |

# Our Game

We chose to write Texas Hold 'Em, a variant of poker, for four to six players.
The game features two cards dealt face down to each player, and up to five cards
dealt face up, from which players must make the best poker hand. There are
several rounds of betting alternated with new cards being revealed. During
betting players can call, raise, or fold (drop out of the hand). If two or more
players are still in the hand when the final round of betting concludes (after
the final cards are shown), the players must show their cards and the best hand
wins the pot. If only one player is left in the hand at any point before the
final call, that player wins the pot regardless of their cards.

# Our Project

We wrote a node.js express app using a postgresql database, with the database
managed using migrations from node-pg-migrate. We wrote our project in
Typescript, compiled to Javascript using esbuild.

# Our Data Organization

We have four tables that we've created ourselves, users, game_lobbies, players,
and cards. We also have a code-generated table that stores session data. Users
stores the information unique to each user who signs up, their id, username,
email and hashed password (passwords are hashed with bcrypt). Users also stores
the balance, the amount of money a user has available to wager on games.
Game_lobbies stores the information unique to each game, its id and name, the
buy in (the minimum amount players must bring to the table to join the game),
the pot (the amount that's been bet on the current hand) the game_stage (an enum
that tracks where in a hand the game is), and the big_blind (the minimum bet for
a hand, which one player must bet in advance and one player must bet half of in
advance). The game_lobbies table also uses foreign keys from the players table
and the cards table in order to track the dealer (the player from whom betting
begins), the current player (the player whose turn it is to bet) and the face-up
community cards. Players pairs users with game_lobbies by holding foreign keys
to both tables, while also including a player's stake - the amount of their
balance they bring to a game, their player status - an enum, their current bet,
and their spot in the play order. Cards tracks the 52 cards in a deck for each
game, with a foreign key to game_lobbies for each card and a suit, value, and
shuffled order - the randomized order of the card in the deck. Finally, sessions
tracks each user's unique login session.
