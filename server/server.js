// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const cors = require("cors");
app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Assign roles and emit them
function assignRoles(gameId) {
  const game = games[gameId];
  const players = game.players;
  const numSpies = 2;
  const shuffled = players.sort(() => 0.5 - Math.random()); // Shuffle array

  // Assign roles
  shuffled.forEach((player, index) => {
    player.role = index < numSpies ? "Spy" : "Resistance";
  });

  // Emit roles to each player
  // shuffled.forEach((player) => {
  //   io.to(player.socketId).emit("roleReveal", { role: player.role });
  // });
  // console.log(games[gameId]);
}

const games = {};

// Distribution of players as resistance and spies based on total player count
const playerRolesDistribution = {
  5: { resistance: 3, spies: 2 },
  6: { resistance: 4, spies: 2 },
  7: { resistance: 4, spies: 3 },
  8: { resistance: 5, spies: 3 },
  9: { resistance: 6, spies: 3 },
  10: { resistance: 6, spies: 4 },
};

// Number of players required for each mission per game size
const missionTeamRequirements = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("createGame", ({ creatorName, numberOfPlayers }) => {
    console.log("HELOO");
    const gameId = generateRandomString();
    games[gameId] = {
      gameId,
      creatorName,
      numberOfPlayers,
      roundNum: 1,
      players: [{ name: creatorName, socketId: socket.id, role: null }],
      roundLeader: null,
      roundApproves: [],
      currentMissionCrew: [],
      numberOfSpyWins: 0,
      numberOfResistanceWins: 0,
    };

    socket.join(gameId);
    socket.gameId = gameId;
    console.log(`${creatorName} created game: ${gameId}`);
    io.to(gameId).emit("gameCreated", games[gameId]); // Broadcasting to the room
    socket.emit("gameDetails", games[gameId]); // Direct response to the creator
    console.log(games[gameId]);
  });

  socket.on("joinGame", ({ name, gameId }) => {
    if (games[gameId]) {
      games[gameId].players.push({ name, socketId: socket.id, role: null });
      socket.join(gameId);
      socket.gameId = gameId;
      console.log(`${name} joined game: ${gameId}`);
      io.to(gameId).emit("playerJoined", games[gameId]); // Notify all in the room
      socket.emit("gameDetails", games[gameId]); // Direct response to the joiner
      socket.emit("gameJoined", {
        message: "Join successful.",
        gameId: gameId,
      });
    } else {
      socket.emit("joinError", "Game not found");
    }
  });

  socket.on("requestGameDetails", (data) => {
    console.log("HIIIIIIIII");
    const game = games[data.gameId];
    if (game) {
      socket.emit("gameDetails", game);
    } else {
      socket.emit("error", { message: "Game not found" });
    }
  });

  socket.on("updateGameDetails", (data) => {
    games[data.gameId] = data.details;
  });

  socket.on("liveUpdateGameDetails", (data) => {
    console.log("Live UPDATE OF");
    console.log(data.gameDetails);
    games[data.gameId] = data.gameDetails;
    io.to(data.gameId).emit("missionUpdate", games[data.gameId]);
  });

  socket.on("startGame", (data) => {
    const game = games[data.gameId];
    if (game) {
      game.numberOfPlayers = game.players.length;
      assignRoles(data.gameId);
      game.roundLeader = game.players[0];
      io.to(data.gameId).emit("gameStart", { message: "Game is starting" });
    } else {
      socket.emit("error", { message: "Game not found" });
    }
  });

  socket.on("requestRole", (gameId) => {
    console.log(gameId);
    io.to(socket.id).emit("roleReveal", {
      role: games[gameId].players.find(
        (player) => player.socketId === socket.id
      ).role,
    });
    console.log(games[gameId]);
    console.log(
      games[gameId].players.find((player) => player.socketId === socket.id).role
    );
  });

  socket.on("finalizeSelection", (gameId) => {
    console.log(gameId);
    io.to(gameId).emit("selectionFinal");
  });

  socket.on("roundWin", (data) => {
    games[data.gameId].roundNum++;
    console.log(data.gameId);
    if (data.SpiesWin) {
      console.log("Spies Won last round");
      games[data.gameId].numberOfSpyWins++;
    } else {
      console.log("Reistance Won last round");
      games[data.gameId].numberOfResistanceWins++;
    }
    if (games[data.gameId].numberOfSpyWins > 2) {
      console.log("Spies Won the game!");
      io.to(data.gameId).emit("GameOver", { gameWinner: "Spies" });
    } else if (games[data.gameId].numberOfResistanceWins > 2) {
      console.log("Resistance Won the game!");
      io.to(data.gameId).emit("GameOver", { gameWinner: "Resistance" });
    } else {
      console.log("Next Round!");
      io.to(data.gameId).emit("GameOver", { gameWinner: "TBD" });
    }
    games[data.gameId].roundApproves = [];
    games[data.gameId].currentMissionCrew = [];
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    if (socket.gameId && games[socket.gameId]) {
      const game = games[socket.gameId];
      const playerIndex = game.players.findIndex(
        (p) => p.socketId === socket.id
      );
      if (playerIndex !== -1) {
        const playerName = game.players[playerIndex].name;
        game.players.splice(playerIndex, 1);
        console.log(`${playerName} left the game: ${socket.gameId}`);
        io.to(socket.gameId).emit("playerLeft", games[socket.gameId]);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.get('/', (req, res) => res.send('Hello from the server!'));

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });
