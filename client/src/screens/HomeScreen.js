// client/src/screens/HomeScreen.js
import React, { useState, useContext, useCallback } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { SocketContext } from "../SocketContext"; // Import SocketContext
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

const HomeScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const socket = useContext(SocketContext); // Get the socket from context

  useFocusEffect(
    useCallback(() => {
      if (!socket) return; // Ensure socket is initialized

      const handleGameCreated = (data) => {
        console.log(`Game created successfully with ID: ${data.gameId}`);
        navigation.navigate("GameLobby", {
          gameId: data.gameId,
          name: data.gameLeader.name,
        });
      };

      socket.on("gameCreated", handleGameCreated);

      // Clean up the effect when leaving the screen
      return () => {
        socket.off("gameCreated", handleGameCreated);
      };
    }, [socket, navigation]) // Re-run the effect if socket or navigation changes
  );

  const createGame = () => {
    if (name.length < 1 || name.length > 15) {
      alert("Username must be at least 1 character and less than 15");
    } else {
      const numberOfPlayers = 1;
      socket?.emit("createGame", { creatorName: name, numberOfPlayers });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resistance</Text>
      <Text style={styles.subtitle}>The Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Button title="Create Game" onPress={createGame} />
      <Button
        title="Join Game"
        onPress={() => {
          if (name.length < 1 || name.length > 15) {
            alert("Username must be at least 1 character and less than 15");
          } else {
            navigation.navigate("JoinGame", { name });
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
    marginBottom: 55,
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
});

export default HomeScreen;
