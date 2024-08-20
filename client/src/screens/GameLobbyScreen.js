// client/src/screens/GameLobbyScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import io from "socket.io-client";

const GameLobbyScreen = ({ route, navigation }) => {
  const { gameId, socket } = route.params;
  const [gameDetails, setGameDetails] = useState(null);
  // const socket = io("http://192.168.191.1:3000"); // Change to your actual server address

  useEffect(() => {
    socket.emit("requestGameDetails", { gameId });

    socket.on("gameDetails", (details) => {
      setGameDetails(details);
    });

    const handlePlayerJoined = (details) => {
      setGameDetails(details);
    };

    socket.on("playerJoined", handlePlayerJoined);

    const handlePlayerLeft = (details) => {
      setGameDetails(details);
    };

    socket.on("playerLeft", handlePlayerLeft);

    const startGame = () => {
      // Check if there's enough players first
      // Make sure to show users warning message that game needs 5 to 10 players to start
      console.log("Starting game...");
      navigation.navigate("Reveal", {
        socket,
        gameId,
      });
    };

    socket.on("gameStart", startGame);

    socket.on("error", (error) => {
      console.error("Error:", error.message);
    });

    return () => socket.disconnect(); // Cleanup on unmount
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
      <Button
        title="Start Game"
        onPress={() => socket.emit("startGame", { gameId })}
      />
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
