import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

const RoundEndScreen = ({ route, navigation }) => {
  const { socket, gameId, name, spiesWin, sabotages, isSkipped, leader } =
    route.params;

  useFocusEffect(
    useCallback(() => {
      // Emit the round result to the server if the client is the leader
      console.log("Revealed spies winner?: could be skipped " + spiesWin);
      console.log(leader.socketId);
      if (socket.id === leader.socketId) {
        socket.emit("roundWin", { gameId, spiesWin, isSkipped });
      }

      let timer; // Define the timer outside to clear it properly

      const handleGameOver = ({ gameWinner }) => {
        // Navigate back to the "Game" screen after 3 seconds
        console.log("handleGameOverTriggered!!!!!!!!!!");
        console.log(gameWinner);

        timer = setTimeout(() => {
          if (gameWinner === "TBD") {
            navigation.navigate("Game", { socket, gameId, name }); // Pass necessary parameters
          } else if (gameWinner !== "TBD") {
            navigation.navigate("GameOver", {
              socket,
              gameId,
              name,
              gameWinner,
            }); // Pass necessary parameters
          }
        }, 3000);
      };

      const handlePlayerLeft = (details) => {
        console.log("Player left mid-game. Navigating to Retry screen.");
        // Cancel the game navigation if a player leaves
        clearTimeout(timer); // Clear the GameOver timer to avoid conflicting navigations
        navigation.navigate("Retry", { name, gameId, socket });
      };

      // Set up socket listeners
      socket.on("GameOver", handleGameOver);
      socket.on("playerLeft", handlePlayerLeft);

      // Cleanup function
      return () => {
        clearTimeout(timer); // Clean up the timer
        socket.off("GameOver", handleGameOver); // Clean up the socket listener for GameOver
        socket.off("playerLeft", handlePlayerLeft); // Clean up the socket listener for playerLeft
      };
    }, [navigation, socket, gameId, spiesWin, name, leader.socketId])
  );

  return (
    <View style={styles.container}>
      {isSkipped ? (
        <Text>Skipping Leader</Text>
      ) : spiesWin ? (
        <Text style={styles.revealText}>
          Spies Win the round! with {sabotages} sabotages
        </Text>
      ) : (
        <Text style={styles.revealText}>
          Resistance Wins the round! There was {sabotages} sabotages
        </Text>
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
  revealText: {
    fontSize: 30,
    color: "red",
    fontWeight: "bold",
  },
});

export default RoundEndScreen;
