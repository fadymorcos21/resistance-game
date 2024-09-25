import React, { useEffect, useState, useContext } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import io from "socket.io-client";
import { SocketContext } from "../SocketContext";

const GameOverScreen = ({ route, navigation }) => {
  const { gameId, name, gameWinner } = route.params;
  const [showButton, setShowButton] = useState(false);
  const [spies, setSpies] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Request game details (who the spies were) before wiping the game
    socket.emit("requestGameDetails", { gameId });

    // Listen for the game details response
    socket.on("gameDetails", (gameDetails) => {
      // Assuming the server sends the list of spies in the gameDetails
      const spyPlayers = gameDetails.players.filter(
        (player) => player.role === "Spy"
      );
      setSpies(spyPlayers);
    });

    // Wait for 1.5 seconds before emitting "WipeGame" to avoid timing issues
    const wipeTimer = setTimeout(() => {
      socket.emit("WipeGame", gameId);
    }, 1500);

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

    // After 2.5 seconds, set showButton to true
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2500);

    // Clear timeout if the component is unmounted
    // Clean up the effect
    return () => {
      // Clean up listeners when component unmounts or dependencies change
      socket.off("gameJoined");
      socket.off("joinError");
      clearTimeout(timer);
    };
  }, []);

  const playAgain = () => {
    console.log(`Attempting join`);
    console.log(`Joining with name ${name}`);
    socket.off("gameDetails");
    socket.emit("joinGame", { name, gameId: gameId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.revealText}>{gameWinner} Wins!</Text>
      {/* Show the list of spies */}
      <Text style={styles.revealText}>Spies were:</Text>
      {spies.length > 0 ? (
        spies.map((spy, index) => (
          <Text key={index} style={styles.spyText}>
            {spy.name}
          </Text>
        ))
      ) : (
        <Text style={styles.spyText}>Loading...</Text>
      )}

      {showButton && (
        <TouchableOpacity onPress={() => playAgain()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Play Again</Text>
          </View>
        </TouchableOpacity>
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
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default GameOverScreen;
