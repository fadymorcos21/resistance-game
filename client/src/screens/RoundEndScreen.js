import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const RoundEndScreen = ({ route, navigation }) => {
  const { socket, gameId, name, spiesWin, numberOfSpies, leader } =
    route.params;

  useFocusEffect(() => {
    // Emit the round result to the server
    console.log("Revealed spies winner?: " + spiesWin);
    if (socket.id === leader?.socketId) {
      socket.emit("roundWin", { gameId, spiesWin });
    }

    socket.on("GameOver", ({ gameWinner }) => {
      // Navigate back to the "Game" screen after 3 seconds
      const timer = setTimeout(() => {
        if (gameWinner === "TBD") {
          navigation.navigate("Game", { socket, gameId, name }); // Pass necessary parameters
        } else if (gameWinner != "TBD") {
          navigation.navigate("GameOver", { socket, gameId, name, gameWinner }); // Pass necessary parameters
        }
      }, 3500);
    });
  }, [navigation, socket, gameId, spiesWin, name]);

  return (
    <View style={styles.container}>
      {spiesWin ? (
        <Text style={styles.revealText}>Spies Win the round!</Text>
      ) : (
        <Text style={styles.revealText}>Resistance Wins the round!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  revealText: {
    fontSize: 30,
    color: "red",
    fontWeight: "bold",
  },
});

export default RoundEndScreen;
