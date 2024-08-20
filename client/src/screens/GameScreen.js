import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Picker,
  ScrollView,
} from "react-native";
import io from "socket.io-client";

const GameScreen = ({ route, navigation }) => {
  const { socket, gameId } = route.params;
  const [missionNumber, setMissionNumber] = useState(1);
  const [missionCrew, setMissionCrew] = useState([]);
  const [approves, setApproves] = useState(["Karim"]);
  const [gameDetails, setGameDetails] = useState(null);

  // Number of players required for each mission per game size
  const missionTeamRequirements = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
  };

  useEffect(() => {
    console.log("IN EFFECT GAME SCREEN");
    socket.emit("requestGameDetails", { gameId });

    socket.on("gameDetails", (details) => {
      console.log("HERE");
      console.log(details);
      setGameDetails(details);
    });

    socket.on("missionUpdate", ({ missionNumber, votes }) => {
      setMissionNumber(missionNumber);
      setApproves(votes);
    });

    socket.on("voteReceived", ({ playerId, vote }) => {
      setApproves((prevApproves) => ({
        ...prevApproves,
        [playerId]: vote,
      }));
    });

    return () => {
      socket.off("missionUpdate");
      socket.off("voteReceived");
    };
  }, []);

  const handlePlayerSelection = (playerId) => {
    setMissionCrew((prev) => [...prev, playerId]);
    // Have to emit to surver on any change so everyone can see
  };

  const submitSelection = () => {
    socket.emit("submitMission", { gameId, players: missionCrew });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mission</Text>
      <ScrollView style={styles.selectionArea}>
        {gameDetails &&
          Array.from({
            length:
              missionTeamRequirements[gameDetails.numberOfPlayers][
                missionNumber - 1
              ],
          }).map((_, index) => (
            <Picker
              selectedValue={"Fady"}
              style={styles.picker}
              // onValueChange={(itemValue) => handlePlayerSelection(player.id)}
              // enabled={socket.id === leaderId} // Only enable if this client is the leader
              key={index}
            >
              {gameDetails.players.map((player) => (
                <Picker.Item label={player.name} value={player.socketId} />
              ))}
            </Picker>
          ))}
      </ScrollView>
      {/* {socket.id === leaderId && (
        <Button title="Submit Selection" onPress={submitSelection} />
      )} */}
      <View style={styles.voteResults}>
        {Object.entries(approves).map((player) => (
          <Text>{player}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectionArea: {
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    marginBottom: 10,
  },
  voteResults: {
    marginTop: 20,
  },
});

export default GameScreen;
