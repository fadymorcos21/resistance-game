// client/src/screens/GameLobbyScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import io from "socket.io-client";

const GameLobbyScreen = ({ route, navigation }) => {
  const { gameId, socket, name } = route.params;
  const [gameDetails, setGameDetails] = useState(null);
  const [gameLeader, setGameLeader] = useState(null);

  useEffect(() => {
    console.log(`Creator of the game's name is : ${name}`);
    socket.emit("requestGameDetails", { gameId });

    socket.on("gameDetails", (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
    });

    const handlePlayerJoined = (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
    };

    socket.on("playerJoined", handlePlayerJoined);

    const handlePlayerLeft = (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
      console.log("NEW GAME LEADER: ");
      console.log(details.gameLeader);
    };

    socket.on("playerLeft", handlePlayerLeft);

    const startGame = () => {
      // Check if there's enough players first
      // Make sure to show users warning message that game needs 5 to 10 players to start
      console.log("Starting game...");
      navigation.navigate("Reveal", {
        socket,
        gameId,
        name,
      });
    };

    socket.on("gameStart", startGame);

    socket.on("error", (error) => {
      console.error("Error:", error.message);
    });

    return () => socket.off(); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Game PIN: {gameDetails?.gameId || gameId}
      </Text>
      <ScrollView style={styles.playerList}>
        {gameDetails?.players.map((player, index) => (
          <Text key={index} style={styles.player}>
            {player.name}
          </Text>
        ))}
      </ScrollView>
      {gameLeader?.socketId === socket.id ? (
        <Button
          title="Start Game"
          onPress={() => {
            if (gameDetails?.players.length < 5) {
              alert("Need at least 5 players to start game");
            } else {
              socket.emit("startGame", { gameId });
            }
          }}
        />
      ) : (
        <Text>Waiting for host to start...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  playerList: {
    width: "100%",
    marginBottom: 20,
  },
  player: {
    fontSize: 18,
    paddingVertical: 5,
  },
});

export default GameLobbyScreen;
