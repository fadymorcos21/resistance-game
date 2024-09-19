import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

const RoundEndScreen = ({ route, navigation }) => {
  const { socket, gameId, name, spiesWin, sabotages, isSkipped, leader } =
    route.params;

  useFocusEffect(
    useCallback(() => {
      // Emit the round result to the server
      console.log("Revealed spies winner?: could be skipped " + spiesWin);
      console.log(leader.socketId);
      if (socket.id === leader.socketId) {
        socket.emit("roundWin", { gameId, spiesWin, isSkipped });
      }

      const handleGameOver = ({ gameWinner }) => {
        // Navigate back to the "Game" screen after 3 seconds
        console.log("handleGameOverTriggered!!!!!!!!!!");
        console.log(gameWinner);

        const timer = setTimeout(() => {
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

        return () => clearTimeout(timer); // Clean up the timer
      };

      socket.on("GameOver", (data) => {
        handleGameOver(data);

        // Acknowledge receipt of the GameOver event
        socket.emit("acknowledgeGameOver", { gameId });
      });

      return () => {
        socket.off("GameOver", handleGameOver); // Clean up the socket listener
      };
    }, [navigation, socket, gameId, spiesWin, name, leader.socketId]) // Wrap the function in useCallback and pass dependencies
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
