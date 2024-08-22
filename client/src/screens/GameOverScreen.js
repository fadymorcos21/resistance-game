import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const GameOverScreen = ({ route, navigation }) => {
  const { socket, gameId, name, gameWinner } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.revealText}>{gameWinner} Wins!</Text>
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

export default GameOverScreen;
