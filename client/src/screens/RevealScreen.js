import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import io from "socket.io-client";

const RevealScreen = ({ route, navigation }) => {
  const { socket, gameId, name } = route.params;

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit("requestRole", gameId);

    socket.on("roleReveal", ({ role }) => {
      setTimeout(() => {
        setRole(role);
        setLoading(false);
        console.log("MADE IT HERE");
      }, 3000); // Delay for 3 seconds to build suspense
      // Wait additional 4 seconds after reveal to build suspense
      setTimeout(() => {
        navigation.navigate("Game", { gameId, socket, name }); // Pass necessary parameters
      }, 4000);
    });

    return () => {
      socket.off("roleReveal");
    };
  }, [socket, navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <Text style={styles.text}>You are...</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      ) : (
        <Text style={styles.revealText}>{role}!</Text>
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

export default RevealScreen;
