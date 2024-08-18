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

const games = {};

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("createGame", ({ creatorName, numberOfPlayers }) => {
    const gameId = generateRandomString();
    games[gameId] = {
      gameId,
      creatorName,
      numberOfPlayers,
      players: [{ name: creatorName, socketId: socket.id, isSpy: false }],
    };

    socket.join(gameId);
    socket.gameId = gameId;
    console.log(`${creatorName} created game: ${gameId}`);
    io.to(gameId).emit("gameCreated", games[gameId]); // Broadcasting to the room
    socket.emit("gameDetails", games[gameId]); // Direct response to the creator
  });

  socket.on("joinGame", ({ name, gameId }) => {
    if (games[gameId]) {
      games[gameId].players.push({ name, socketId: socket.id, isSpy: false });
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
    const game = games[data.gameId];
    if (game) {
      socket.emit("gameDetails", game);
    } else {
      socket.emit("error", { message: "Game not found" });
    }
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
