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
  const [missionNumber, setMissionNumber] = useState(null);
  const [missionCrew, setMissionCrew] = useState([]);
  const [approves, setApproves] = useState(["Karim"]);
  const [gameDetails, setGameDetails] = useState(null);
  const [leaderId, setLeaderId] = useState(null);

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

      // Set missionNumber directly from the server's roundNum
      const missionNum = details.roundNum;
      setMissionNumber(missionNum);

      setLeaderId(details.roundLeader);

      if (details.currentMissionCrew.length == 0) {
        // Initialize missionCrew with placeholders based on mission requirements
        const initialMissionCrew = Array(
          missionTeamRequirements[details.numberOfPlayers][missionNumber - 1]
        ).fill(null);
        setMissionCrew(initialMissionCrew);

        details.currentMissionCrew = initialMissionCrew;

        socket.emit("updateGameDetails", { details, gameId });
      }
    });

    const handleLiveUpdate = (details) => {
      console.log("Live update got back");
      setMissionNumber(details.roundNum);
      setApproves(details.roundApproves);
      setLeaderId(details.roundLeader);
      console.log(details.currentMissionCrew);
      setMissionCrew(details.currentMissionCrew);
    };

    socket.on("missionUpdate", handleLiveUpdate);

    socket.on("voteReceived", ({ playerId, vote }) => {
      setApproves((prevApproves) => ({
        ...prevApproves,
        [playerId]: vote,
      }));
    });

    return () => {
      socket.off("gameDetails");
      socket.off("missionUpdate");
      socket.off("voteReceived");
    };
  }, []);

  const handlePlayerSelection = (playerId, ind) => {
    // Update the missionCrew state first
    setMissionCrew((prevArray) => {
      const newArray = [...prevArray];
      newArray[ind] = playerId;

      // After updating the missionCrew state, update gameDetails
      const updatedGameDetails = {
        ...gameDetails,
        currentMissionCrew: newArray,
      };

      // Emit the updated gameDetails to the server
      socket.emit("liveUpdateGameDetails", {
        gameDetails: updatedGameDetails,
        gameId,
      });

      return newArray;
    });
  };

  const submitSelection = () => {
    socket.emit("submitMission", { gameId, players: missionCrew });
  };

  return (
    <View style={styles.container}>
      {missionNumber && (
        <Text style={styles.header}>Mission {missionNumber}</Text>
      )}
      <ScrollView style={styles.selectionArea}>
        {missionNumber &&
          gameDetails &&
          Array.from({
            length:
              missionTeamRequirements[gameDetails.numberOfPlayers][
                missionNumber - 1
              ],
          }).map((_, index) => (
            <Picker
              selectedValue={missionCrew[index]}
              style={styles.picker}
              onValueChange={(itemValue) =>
                handlePlayerSelection(itemValue, index)
              }
              key={index}
              // enabled={socket.id === leaderId} // Only enable if this client is the leader
            >
              <Picker.Item label="Select a player" value={null} />
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
