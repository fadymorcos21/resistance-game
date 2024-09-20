import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";

const GameOverScreen = ({ route, navigation }) => {
  const { socket, gameId, name, gameWinner } = route.params;
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    socket.emit("WipeGame", gameId);

    socket.on("gameJoined", (data) => {
      console.log(`Game joined successfully with ID: ${data.gameId}`);
      navigation.navigate("GameLobby", {
        gameId: data.gameId,
        socket,
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
    socket.emit("joinGame", { name, gameId: gameId });
    // navigation.navigate("GameLobby", { gameId, socket, name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.revealText}>{gameWinner} Wins!</Text>
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
