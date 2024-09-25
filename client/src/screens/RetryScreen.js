// client/src/screens/JoinGameScreen.js
import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, StyleSheet, TextInput } from "react-native";
import io from "socket.io-client";
import { SocketContext } from "../SocketContext";

const RetryScreen = ({ route, navigation }) => {
  const { name, gameId } = route.params;
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.emit("WipeGame", gameId);

    socket.on("gameJoined", (data) => {
      console.log(`Game joined successfully with ID: ${data.gameId}`);
      navigation.navigate("GameLobby", {
        gameId: data.gameId,
        name,
      });
    });

    socket.on("joinError", (data) => {
      console.log("WHATS POOPERRS");
      console.log(data.message);
      alert("Join Failed: " + data.message);
    });

    // Clean up the effect
    return () => {
      // Clean up listeners when component unmounts or dependencies change
      socket.off("gameJoined");
      socket.off("joinError");
    };
  }, []);

  const joinGame = () => {
    console.log(`Attempting join`);
    socket.emit("joinGame", { name, gameId: gameId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Some one left and broke the game</Text>
      <Text style={styles.subtitle}>Go back to game lobby and try again</Text>
      <Text style={styles.subtitle}>Don't fricken close the app hoes</Text>

      <Button title="Back to lobby" onPress={() => joinGame()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 200,
  },
  title: {
    fontSize: 34,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  auther: {
    fontSize: 15,
    marginBottom: 70,
  },
  input: {
    width: "100%",
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
});

export default RetryScreen;
