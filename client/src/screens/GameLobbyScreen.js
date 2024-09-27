// client/src/screens/GameLobbyScreen.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { SocketContext } from "../SocketContext";

const GameLobbyScreen = ({ route, navigation }) => {
  const { gameId, name } = route.params;
  const [gameDetails, setGameDetails] = useState(null);
  const [gameLeader, setGameLeader] = useState(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    console.log(`Creator of the game's name is: ${name}`);
    socket.emit("requestGameDetails", { gameId });

    socket.on("gameDetails", (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
    });

    const handlePlayerJoined = (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
    };

    socket.on("playerJoined", handlePlayerJoined);

    const handlePlayerLeft = (details) => {
      setGameDetails(details);
      setGameLeader(details.gameLeader);
    };

    socket.on("playerLeft", handlePlayerLeft);

    const startGame = () => {
      console.log("Starting game...");
      navigation.navigate("Reveal", {
        gameId,
        name,
      });
    };

    socket.on("gameStart", startGame);

    socket.on("error", (error) => {
      console.error("Error:", error.message);
    });

    // Disconnect the socket when leaving the screen
    return () => {
      socket.emit("playerLeft", { gameId, name }); // Inform others that this player left
      // socket.disconnect(); // Disconnect the player
    };
  }, [gameId, name, navigation, socket]);

  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerLeft: () => (
  //       <Button
  //         onPress={() => {
  //           socket.disconnect(); // Disconnect the player from the lobby
  //           navigation.navigate("Home"); // Navigate to the Home screen
  //         }}
  //         title="<- Back to home"
  //         color="#000"
  //       />
  //     ),
  //   });
  // }, [navigation, socket]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Game PIN: {gameDetails?.gameId || gameId}
      </Text>
      <ScrollView style={styles.playerList}>
        {gameDetails?.players.map((player, index) => (
          <Text key={index} style={styles.player}>
            {player.name}
          </Text>
        ))}
      </ScrollView>
      {gameLeader?.socketId === socket.id ? (
        <Button
          title="Start Game"
          onPress={() => {
            if (gameDetails?.players.length < 5) {
              alert("Need at least 5 players to start game");
            } else {
              socket.emit("startGame", { gameId });
            }
          }}
        />
      ) : (
        <Text>Waiting for host to start...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  playerList: {
    width: "100%",
    marginBottom: 20,
  },
  player: {
    fontSize: 18,
    paddingVertical: 5,
  },
});

export default GameLobbyScreen;
