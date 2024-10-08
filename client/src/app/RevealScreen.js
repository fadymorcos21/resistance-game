import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import io from "socket.io-client";
import { SocketContext } from "../SocketContext";

const RevealScreen = ({ route, navigation }) => {
  const { gameId, name } = route.params;
  const socket = useContext(SocketContext);

  const [role, setRole] = useState("");
  const [spies, setSpies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit("requestRole", gameId);

    socket.on("roleReveal", ({ role, spies }) => {
      setTimeout(() => {
        setRole(role);
        setSpies(spies);
        setLoading(false);
      }, 3000); // Delay for 3 seconds to build suspense
      // Wait additional 4 seconds after reveal to build suspense
      setTimeout(() => {
        navigation.navigate("Game", { gameId, name }); // Pass necessary parameters
      }, 4500);
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
        <View>
          <Text style={styles.revealText}>{role}!</Text>
          {role === "Spy" && spies.length > 0 && (
            <Text style={styles.spyText}>
              Other spies: {spies.map((spy) => spy.name).join(", ")}
            </Text>
          )}
        </View>
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
