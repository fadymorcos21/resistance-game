import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const RevealScreen = ({ route, socket }) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("roleReveal", ({ role }) => {
      setTimeout(() => {
        setRole(role);
        setLoading(false);
      }, 3000); // Delay for 3 seconds to build suspense
    });

    return () => {
      socket.off("roleReveal");
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <Text style={styles.text}>You are...</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      ) : (
        <Text style={styles.revealText}>You are a {role}!</Text>
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
