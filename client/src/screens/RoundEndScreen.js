import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const RoundEndScreen = ({ route, navigation }) => {
  const { socket, gameId, name, spiesWin } = route.params;

  useEffect(() => {
    // Emit the round result to the server
    socket.emit("roundWin", { gameId, spiesWin });

    socket.on("GameWinner", ({ gameWinner }) => {
      // Navigate back to the "Game" screen after 3 seconds
      const timer = setTimeout(() => {
        if (gameWinner === "TBD") {
          navigation.navigate("Game", { socket, gameId, name }); // Pass necessary parameters
        } else if (gameWinner != "TBD") {
          navigation.navigate("GameOver", { socket, gameId, name, gameWinner }); // Pass necessary parameters
        }
      }, 3500);
    });

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [navigation, socket, gameId, spiesWin, name]);

  return (
    <View style={styles.container}>
      {spiesWin ? (
        <Text style={styles.revealText}>Spies Win!</Text>
      ) : (
        <Text style={styles.revealText}>Resistance Wins!</Text>
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
