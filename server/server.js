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

// Assign roles and emit them
function assignRoles(gameId) {
  const game = games[gameId];
  const players = game.players;
  console.log([players.length]);
  const numSpies = playerRolesDistribution[players.length].spies;
  const shuffled = players.sort(() => 0.5 - Math.random()); // Shuffle array

  // Assign roles
  shuffled.forEach((player, index) => {
    player.role = index < numSpies ? "Spy" : "Resistance";
  });

  players.sort(() => 0.5 - Math.random()); // Shuffle array
}

const games = {};

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("createGame", ({ creatorName, numberOfPlayers }) => {
    const gameId = generateRandomString();
    games[gameId] = {
      gameId,
      gameLeader: { name: creatorName, socketId: socket.id },
      numberOfPlayers,
      roundNum: 1,
      players: [{ name: creatorName, socketId: socket.id, role: null }],
      roundLeader: null,
      roundApproves: [],
      currentMissionCrew: [],
      numberOfSpyWins: 0,
      numberOfResistanceWins: 0,
      leaderIndex: 0,
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
      if (games[gameId].players.length === 10) {
        socket.emit("joinError", { message: "Game is full!" });
        return;
      } else if (games[gameId].players.length === 0) {
        games[gameId].gameLeader = { name: name, socketId: socket.id };
      }
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
      socket.emit("joinError", { message: "Game not found" });
    }
  });

  socket.on("requestGameDetails", (data) => {
    console.log("Client Requested game details");
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
    console.log(data.gameDetails);
    games[data.gameId] = data.gameDetails;
    io.to(data.gameId).emit("missionUpdate", games[data.gameId]);
  });

  socket.on("startGame", (data) => {
    const game = games[data.gameId];
    if (game) {
      game.numberOfPlayers = game.players.length;
      assignRoles(data.gameId);
      game.roundLeader = game.players[0 % game.players.length];
      io.to(data.gameId).emit("gameStart", { message: "Game is starting" });
    } else {
      socket.emit("error", { message: "Game not found" });
    }
  });

  socket.on("requestRole", (gameId) => {
    console.log(gameId);

    const spies = games[gameId].players
      .filter(
        (player) => player.role === "Spy" && player.socketId !== socket.id
      )
      .map((player) => ({ name: player.name, socketId: player.socketId }));

    io.to(socket.id).emit("roleReveal", {
      role: games[gameId].players.find(
        (player) => player.socketId === socket.id
      ).role,
      spies,
    });
    console.log(games[gameId]);
    console.log(
      games[gameId].players.find((player) => player.socketId === socket.id).role
    );
  });

  socket.on("crewMemberVoted", ({ gameId, action }) => {
    const game = games[gameId]; // Get the game object
    const players = game.players; // Get the players list
    const numPlayers = players.length; // Get the number of players in the game

    game.currentMissionCrew = game.currentMissionCrew.map((player) => {
      if (player.socketId === socket.id) {
        return { ...player, played: action };
      }
      return player;
    });

    // Count the number of sabotages
    const sabotages = game.currentMissionCrew.filter(
      (player) => player.played === "sabotage"
    ).length;

    // Check if all crew members have voted before proceeding
    const allVoted = game.currentMissionCrew.every((player) => player.played);

    if (!allVoted) {
      console.log("Waiting for all crew members to vote.");
      return;
    }

    // Determine if spies win based on the sabotages
    let spiesWin = false;

    // If at least 7 players and it's round 4 or later, 2 sabotages are needed for spies to win
    if (numPlayers >= 7 && game.roundNum >= 4) {
      spiesWin = sabotages >= 2;
    } else {
      // Otherwise, 1 sabotage is enough for spies to win
      spiesWin = sabotages >= 1;
    }

    // Broadcast the mission result to all players
    io.to(gameId).emit("missionResult", {
      sabotages,
      spiesWin,
    });
  });

  socket.on("finalizeSelection", (gameId) => {
    console.log(gameId);
    io.to(gameId).emit("selectionFinal");
  });

  socket.on("roundWin", (data) => {
    console.log("sending trigger");
    const shuffleAndPickLeader = (players) => {
      const shuffledPlayers = players.sort(() => 0.5 - Math.random());
      return shuffledPlayers[0]; // Return the first player as the new leader
    };

    // increment only if not skipped
    if (!data.isSkipped) {
      games[data.gameId].roundNum++;
    }
    // const lead = shuffleAndPickLeader(games[data.gameId].players);
    games[data.gameId].roundLeader =
      games[data.gameId].players[
        ++games[data.gameId].leaderIndex % games[data.gameId].players.length
      ];
    console.log("New leader picked, players array: ");
    console.log(games[data.gameId].players);

    games[data.gameId].roundApproves = [];
    games[data.gameId].currentMissionCrew = [];

    let totalClients = io.sockets.adapter.rooms.get(data.gameId)?.size || 0;
    let clientsInRoom = io.sockets.adapter.rooms.get(data.gameId);
    console.log(`There are ${totalClients} in the room`);
    console.log(`They are: `, Array.from(clientsInRoom));

    // All this should be if not skipped

    // Add a delay before emitting the event to give other clients time to transition
    setTimeout(() => {
      console.log("Sending GameOver event after delay...");
      if (!data.isSkipped) {
        if (data.spiesWin) {
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
      } else {
        console.log("Next Leader!");
        io.to(data.gameId).emit("GameOver", { gameWinner: "TBD" });
      }
    }, 1000); // Delay by 1 second (1000 milliseconds)
  });

  socket.on("WipeGame", (gameId) => {
    const gameLeader = games[gameId].gameLeader;
    const numberOfPlayers = games[gameId].numberOfPlayers;

    games[gameId] = {
      gameId,
      gameLeader,
      numberOfPlayers,
      roundNum: 1,
      players: [],
      roundLeader: null,
      roundApproves: [],
      currentMissionCrew: [],
      numberOfSpyWins: 0,
      numberOfResistanceWins: 0,
      leaderIndex: 0,
    };
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    if (socket.gameId && games[socket.gameId]) {
      const game = games[socket.gameId];
      const playerIndex = game.players.findIndex(
        (p) => p.socketId === socket.id
      );
      if (playerIndex !== -1) {
        if (socket.id === game.gameLeader.socketId) {
          const newGameLeader =
            game.players[(playerIndex + 1) % game.players.length];
          game.gameLeader = {
            name: newGameLeader.name,
            socketId: newGameLeader.socketId,
          };
        }
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
