// client/src/screens/CreateGameScreen.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import io from "socket.io-client";
import { Picker } from "@react-native-picker/picker";
import { SocketContext } from "../SocketContext";

const CreateGameScreen = ({ route, navigation }) => {
  const { name } = route.params;
  const [numberOfPlayers, setNumberOfPlayers] = useState("5");
  socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("gameCreated", (data) => {
      console.log(`Game created successfully with ID: ${data.gameId}`);
      navigation.navigate("GameLobby", {
        gameId: data.gameId,
      });
    });

    // Clean up the effect
    return () => {
      socket.off("gameCreated");
      // socket.disconnect();
    };
  }, []);

  const createGame = () => {
    console.log(`Game created by ${name} with ${numberOfPlayers} players.`);
    socket.emit("createGame", { creatorName: name, numberOfPlayers });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Number of Players:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={numberOfPlayers}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            setNumberOfPlayers(itemValue)
          }
        >
          <Picker.Item label="5" value="5" />
          <Picker.Item label="6" value="6" />
          <Picker.Item label="7" value="7" />
          <Picker.Item label="8" value="8" />
          <Picker.Item label="9" value="9" />
          <Picker.Item label="10" value="10" />
        </Picker>
      </View>
      <Button title="Create Game" onPress={() => createGame()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff", // It's good you're using a light background
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  pickerContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    marginBottom: 40, // Increase the bottom margin to separate from the button
  },
  picker: {
    width: "100%", // Full width for better usability
    height: 150, // Adjusting the height to make it less lengthy
  },
  buttonContainer: {
    marginTop: 20, // Adds space above the button
    width: "90%", // Slightly less than full width for aesthetics
  },
  button: {
    backgroundColor: "#007BFF", // Example blue color for the button
    color: "white", // Ensures text is visible
    padding: 10, // Padding inside the button for better touch area
    borderRadius: 5, // Rounded corners
  },
  buttonText: {
    textAlign: "center", // Centers text within the button
    color: "white", // White text for visibility
  },
});

export default CreateGameScreen;
