// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const cors = require("cors");
app.use(cors()); // This will enable CORS for all routes and all origins by default

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

const io = require("socket.io")(server, {
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

// Games storage
const games = {};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Create game event
  socket.on("createGame", ({ creatorName, numberOfPlayers }) => {
    console.log("Something....");
    const gameId = generateRandomString();
    games[gameId] = {
      gameId,
      creatorName,
      numberOfPlayers,
      players: [creatorName], // Add the creator as the first player
    };

    socket.join(gameId);
    console.log(`${creatorName} created game: ${gameId}`);
    socket.emit("gameCreated", { gameId });
  });

  // Join game event
  socket.on("joinGame", ({ name, gameId }) => {
    if (games[gameId]) {
      games[gameId].players.push(name);
      socket.join(gameId);
      console.log(`${name} joined game: ${gameId}`);
      io.to(gameId).emit("playerJoined", { name, gameId });
    } else {
      socket.emit("error", "Game not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.get('/', (req, res) => res.send('Hello from the server!'));

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });
