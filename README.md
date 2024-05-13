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

# Our Site
On our site a user can register an account with a username, email and password.
Once they do that, they can log in. When they log in they can create a new 
game lobby or join an existing game lobby. Once the player is in a game lobby
they can take one of six available seats in the game. Once a minimum of four
players have joined, any player can click Start to start the next hand. Once 
Start is clicked, cards are dealt and the hand is played. Once the hand 
concludes, the pot is added to the winner's stake and, if at least four players
are still in, a new hand can be started. Players can play in multiple game
lobbies if desired.

# Our Technology

We wrote a node.js express app using a postgresql database, with the database
managed using migrations from node-pg-migrate. We wrote our project in
Typescript, compiled to Javascript using esbuild. We access our database in code
using pg promise, and use socket.io to push from the server to clients. We use 
express session to manage user sessions, with connect-pg-simple used to make
the sessions persistent. User passwords are encrypted using bcrypt. We use ejs
templates to render our pages. We use tailwind css to style our pages.

# Our Data Organization

We have four tables that we've created ourselves, users, game_lobbies, players,
and cards. We also have a code-generated table that stores session data. 

Users stores the information unique to each user who signs up, their id, username,
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
community cards. 

Players pairs users with game_lobbies by holding foreign keys to both tables, 
while also including a player's stake - the amount of their balance they bring 
to a game, their player status - an enum, their current bet,
and their spot in the play order. 

Cards tracks the 52 cards in a deck for each game, with a foreign key to 
game_lobbies for each card and a suit, value, and shuffled order - the randomized 
order of the card in the deck. Finally, sessions tracks each user's unique login 
session.

# Our Code Organization

We organize the bulk of our project into two primary top level folders, backend 
and frontend. 

Backend holds the server.ts file from which we initiate our program.
Backend is then further organized into several folders. The db folder holds our
database connection file, and the dao folder which holds the files for the
database access objects we use to interact with our database. Also in backend is
the middleware folder, which we use to hold session-locals, which allows us
access to the user through the session, and validate-game-exists, which checks
for users attempting to access games via IDs that don't exist in the database.

The backend folder also holds routes, which holds the files for the routes
called by server.ts. Routes contains route files for auth, chat, the homepage,
the game, and root. It also contains index.ts, which exports the routes from
the other files, allowing us to import from the routes folder.

Backend also holds views, which holds our ejs templates. Views is organized
into folders for auth, which holds our login and register templates, game-lobby, 
which holds our game lobby template and the poker table partial, home, which
stores the home page template and the partial for game rows, and partials,
where we store our common partials, our button and chat. 

Finally, backend contains utilities, where we keep a utility for reloading
the server when running in dev, and static, where we compile our frontend
js and css files.

Our frontend folder is organized into folders for events, messages, and 
styles. The events folder holds scripts that determine what happen when
a user triggers an event, such as clicking a button or pressing enter
to send a chat message. These files typically call fetch on a route. 
The messages folder holds scripts that determine what happens when a
message is received over the socket. These are typically triggered by
the routes that the events have sent data to. Finally, styles is where
we hold our tailwind file that compiles to a full css file in our
backend static directory.

# Our Code Progression

First, to start our server, run "npm run dev" from the command line.
It will automatically build all the files you need as well as running
all the necessary node migrations.

When a user arrives at the root of our site the server fires server.ts
(really server.js compiled from server.ts but we'll pretend the code 
is structured as it is pre-compile for purposes of this walkthrough)
which calls the root route. The root route checks if the user is logged
in and if not, redirects them to the auth route, which directs the 
user to the auth/login get route. If the user goes to register they
trigger the auth/registration get route. If they register they
trigger the auth/registration post route which creates a new user
account. If they then log in they trigger the auth/login post route
which creates a new session and logs them in (if their user and password
is correct).

Once a user is logged in they are redirected to the /home route which
redirects to routes in the routes/home.ts file. It triggers get("/")
from home which directs users to the localhost/home page which displays
a list of existing games. The list of games is called from the database
by the get request and then sent via the render event to the ejs template
which renders the games as a list using a partial.

Also on the home screen is a chat. A script sets an eventhandler to 
listen to events on the message box. If the enter key is pressed in the
message box, it fires fetch with a POST event to the server route 
home/chat, which then emits the chat via a socket event to the chat
window of the user and all users connected to the home screen.

If the user clicks join a game they trigger a route in game.ts, 
get("/{id}"), which renders the page for the lobby of a game for that
game id on the url host/game/{id}. From there, a user can click one of
six join buttons, which each fire a fetch event that sends the 
seat number to the backend on the route game/{id}/join. Server.ts
redirects the request to games.ts which redirects the request to
router.post("/{id}/join") which handles creating a player for that
game in the database and then returning that player from the database
so it can emit the player's information on a socket event including
their seat location so that a frontend script that calls socket.on
can react to that event by setting the seat to the player.

If the user clicks create on the home page instead of joining an
existing game, a modal that's part of our ejs template gets 
activated. After the user fills out the stake and name, the button
fires the POST event game/{id}/create, which goes to game.ts
and its router.post("/{id}/create"}. That function creates a new
game lobby in the database, then creates the user as a player added
to the game, then redirects the user to that gamelobby's page.

Once a player has joined a game, they can quit, which fires the
game/{id}/quit event, which deletes the user's player entry for that
game from the database and then updates their seat to set it back to
being joinable. They can then rejoin the same seat or another seat
if they want, as long as seats are empty. If other users come and 
take the seats, the seat occupation events are emitted via the socket
to all users in the game lobby. 

Once at least four users are in a game, the game.ts router.post("/{id}/join")
route has the additional job of setting the start button to active. Any 
player can click the start button
