// client/src/screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import io from "socket.io-client";

const socket = io("http://34.130.113.23:3000");
socket.on("connect", () => {
  console.log("Connected to server");
  console.log(socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

const HomeScreen = ({ navigation }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    socket.on("gameCreated", (data) => {
      console.log(`Game created successfully with ID: ${data.gameId}`);
      navigation.navigate("GameLobby", {
        gameId: data.gameId,
        socket,
        name: data.gameLeader.name,
      });
    });

    // Clean up the effect
    return () => {
      socket.off("gameCreated");
      // socket.disconnect();
    };
  }, []);

  const createGame = () => {
    if (name.length < 1 || name.length > 15) {
      alert("Username must be at least 1 characters and less than 15");
    } else {
      console.log(`Game created by ${name} with ${34} players.`);
      const numberOfPlayers = 1;
      socket.emit("createGame", { creatorName: name, numberOfPlayers });
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resistance</Text>
      <Text style={styles.subtitle}>(The App)</Text>
      <Text style={styles.auther}>By Fady</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={(e) => {
          // Placeholder for joining a game
          setName(e);
          console.log(e);
        }}
      />

      <Button title="Create Game" onPress={() => createGame()} />
      <Button
        title="Join Game"
        onPress={() => {
          if (name.length < 1 || name.length > 15) {
            alert("Username must be at least 1 characters and less than 15");
          } else {
            console.log("Joining a game...");
            navigation.navigate("JoinGame", { name, socket });
          }
        }}
      />
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

export default HomeScreen;
