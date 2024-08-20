import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Picker,
  ScrollView,
  Button,
} from "react-native";

const GameScreen = ({ route, navigation }) => {
  const { socket, gameId } = route.params;
  const [missionNumber, setMissionNumber] = useState(null);
  const [missionCrew, setMissionCrew] = useState([]);
  const [approves, setApproves] = useState(["Karim"]);
  const [gameDetails, setGameDetails] = useState(null);
  const [leader, setLeader] = useState(null);
  const [selectionFinal, setSelectionFinal] = useState(false);

  const missionTeamRequirements = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
  };

  useEffect(() => {
    socket.emit("requestGameDetails", { gameId });

    socket.on("gameDetails", (details) => {
      setGameDetails(details);

      // Set missionNumber directly from the server's roundNum
      const missionNum = details.roundNum;
      setMissionNumber(missionNum);

      // Set the leader object
      setLeader(details.roundLeader);

      if (details.currentMissionCrew.length === 0) {
        const initialMissionCrew = Array(
          missionTeamRequirements[details.numberOfPlayers][missionNum - 1]
        ).fill(null);
        setMissionCrew(initialMissionCrew);

        details.currentMissionCrew = initialMissionCrew;

        socket.emit("updateGameDetails", { details, gameId });
      } else {
        setMissionCrew(details.currentMissionCrew);
      }
    });

    const handleLiveUpdate = (details) => {
      setMissionNumber(details.roundNum);
      setApproves(details.roundApproves);
      setLeader(details.roundLeader);
      setMissionCrew(details.currentMissionCrew);
    };

    const handleSelectionFinalized = (details) => {
      setSelectionFinal(true);
    };

    socket.on("missionUpdate", handleLiveUpdate);

    socket.on("selectionFinal", handleSelectionFinalized);

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
    setMissionCrew((prevArray) => {
      const newArray = [...prevArray];
      newArray[ind] = playerId;

      const updatedGameDetails = {
        ...gameDetails,
        currentMissionCrew: newArray,
      };

      socket.emit("liveUpdateGameDetails", {
        gameDetails: updatedGameDetails,
        gameId,
      });

      return newArray;
    });
  };

  const handleLeaderFinalized = () => {
    setSelectionFinal(() => {
      socket.emit("finalizeSelection", gameId);
      return true;
    });
  };

  return (
    <View style={styles.container}>
      {missionNumber && (
        <Text style={styles.header}>Mission {missionNumber}</Text>
      )}
      {leader && <Text>Leader: {leader.name}</Text>}
      <ScrollView style={styles.selectionArea}>
        {missionNumber &&
          gameDetails &&
          Array.from({
            length:
              missionTeamRequirements[gameDetails.numberOfPlayers][
                missionNumber - 1
              ],
          }).map((_, index) => {
            const selectedPlayer = gameDetails.players.find(
              (player) => player.socketId === missionCrew[index]
            );

            return socket.id === leader?.socketId ? (
              <Picker
                selectedValue={missionCrew[index]}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  handlePlayerSelection(itemValue, index)
                }
                key={index}
              >
                <Picker.Item label="Select a player" value={null} />
                {gameDetails.players.map((player) => (
                  <Picker.Item
                    key={player.socketId}
                    label={player.name}
                    value={player.socketId}
                  />
                ))}
              </Picker>
            ) : (
              <Text key={index} style={styles.text}>
                {selectedPlayer ? selectedPlayer.name : "No selection yet"}
              </Text>
            );
          })}
      </ScrollView>
      {socket.id === leader?.socketId ? (
        <Button
          title="Start mission"
          onPress={() => {
            // Placeholder for joining a game
            console.log("Launching mission");
            handleLeaderFinalized();
            // navigation.navigate("JoinGame", { name, socket });
          }}
        />
      ) : selectionFinal ? (
        <View>
          <Button
            title="Skip"
            onPress={() => {
              console.log(socket.id + " voted skip");
              // hangleVote();
            }}
          />
          <Button
            title="Approve"
            onPress={() => {
              console.log(socket.id + " approved");
              // hangleVote();
            }}
          />
        </View>
      ) : (
        <Text>Waiting for leader to finalize selection</Text>
      )}
      <View style={styles.voteResults}>
        {approves.map((player) => (
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
  text: {
    fontSize: 18,
    marginBottom: 10,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  voteResults: {
    marginTop: 20,
  },
});

export default GameScreen;
