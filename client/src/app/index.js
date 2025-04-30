// client/src/screens/HomeScreen.js

import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SocketContext } from "../SocketContext";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [showSpecs, setShowSpecs] = useState(false);
  const socket = useContext(SocketContext);

  useFocusEffect(
    useCallback(() => {
      if (!socket) return;
      const handleGameCreated = (data) => {
        navigation.navigate("GameLobby", {
          gameId: data.gameId,
          name: data.gameLeader.name,
        });
      };
      socket.on("gameCreated", handleGameCreated);
      return () => socket.off("gameCreated", handleGameCreated);
    }, [socket, navigation])
  );

  const createGame = () => {
    if (name.length < 1 || name.length > 15) {
      alert("Username must be at least 1 character and less than 15");
    } else {
      socket.emit("createGame", { creatorName: name, numberOfPlayers: 1 });
    }
  };

  const instructions =
    "Resistance is a social-deduction game with easy setup: one player creates a game, everyone types in their name and joins via the game PIN from their devices, and secretly spies lurk among you (roles assigned automatically). Succeed on 3 missions to win, or watch the spies sabotage three times and lose.";

  const roundSpecs = [
    { round: 1, goers: 2, sabotagesNeeded: 1 },
    { round: 2, goers: 3, sabotagesNeeded: 1 },
    { round: 3, goers: 2, sabotagesNeeded: 1 },
    { round: 4, goers: 3, sabotagesNeeded: 1 },
    { round: 5, goers: 3, sabotagesNeeded: 1 },
  ];

  const openWiki = () =>
    Linking.openURL("https://en.wikipedia.org/wiki/The_Resistance_(game)");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Resistance</Text>
        <Text style={styles.subtitle}>The Game</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.buttonWrapper}>
          <Button title="Create Game" onPress={createGame} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Join Game"
            onPress={() => {
              if (name.length < 1 || name.length > 15) {
                alert("Username must be at least 1 character and less than 15");
              } else {
                navigation.navigate("JoinGame", { name });
              }
            }}
          />
        </View>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>{instructions}</Text>
          <TouchableOpacity onPress={() => setShowSpecs(true)}>
            <Text style={styles.moreText}>See full round specs…</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openWiki}>
            <Text style={styles.linkText}>
              More in-depth instructions on Wikipedia
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showSpecs}
          animationType="slide"
          onRequestClose={() => setShowSpecs(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Round Specifications</Text>
            <ScrollView>
              {roundSpecs.map((r) => (
                <View key={r.round} style={styles.specRow}>
                  <Text>Round {r.round}</Text>
                  <Text>{r.goers} on mission</Text>
                  <Text>Sabotages: {r.sabotagesNeeded}</Text>
                </View>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setShowSpecs(false)} />
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // vertically center all content
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    maxWidth: 500, // <-- cap width

    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: 500, // <-- cap width
    alignSelf: "center", // <-- center on large screens
    marginBottom: 10,
  },

  instructionsBox: {
    width: "100%",
    maxWidth: 500, // <-- cap width
    alignSelf: "center", // <-- center on large screens
    backgroundColor: "#f5f9ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  moreText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  linkText: {
    textAlign: "center",
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
});
