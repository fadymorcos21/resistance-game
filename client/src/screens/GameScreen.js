import { platform } from "os";
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
  const { socket, gameId, name } = route.params;
  const [missionNumber, setMissionNumber] = useState(null);
  const [missionCrew, setMissionCrew] = useState([]);
  const [approves, setApproves] = useState([]);
  const [gameDetails, setGameDetails] = useState(null);
  const [leader, setLeader] = useState(null);
  const [selectionFinal, setSelectionFinal] = useState(false);
  const [voted, setVoted] = useState(false);

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

    const checkSpyWin = (details) => {
      var spyCount = 0;
      const numOfPlayers = details.numberOfPlayers;
      for (let i = 0; i < details.currentMissionCrew.length; i++) {
        if (details.currentMissionCrew[i].role === "Spy") {
          spyCount++;
        }
      }
      if (missionNumber >= 4 && numOfPlayers >= 7 && spyCount >= 2) {
        // Spies win
        console.log("Spies Win!");
        navigation.navigate("RoundEnd", {
          socket,
          gameId,
          name,
          spiesWin: true,
          numberOfSpies: spyCount,
        });
      } else if (spyCount > 0) {
        // Spies also win
        console.log("Spies Win!");
        navigation.navigate("RoundEnd", {
          socket,
          gameId,
          name,
          spiesWin: true,
          numberOfSpies: spyCount,
        });
      } else {
        // Spies also win
        console.log("Resistance Wins!");
        navigation.navigate("RoundEnd", {
          socket,
          gameId,
          name,
          spiesWin: false,
          numberOfSpies: 0,
        });
      }
    };

    const handleLiveUpdate = (details) => {
      setGameDetails(details);
      setMissionNumber(details.roundNum);
      setApproves(details.roundApproves);
      setLeader(details.roundLeader);
      setMissionCrew(details.currentMissionCrew);

      console.log("Checking if all votes are in:");
      console.log(details.roundApproves.length);
      console.log(details.numberOfPlayers);
      if (details.roundApproves.length + 1 >= details.numberOfPlayers) {
        console.log("All votes are in!");
        checkSpyWin(details);
      }
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

  const handlePlayerSelection = (value, ind) => {
    const player = JSON.parse(value);
    console.log("THIS IS PLAYER : ");
    console.log(player);

    setMissionCrew((prevArray) => {
      const newArray = [...prevArray];
      newArray[ind] = player;

      const updatedGameDetails = {
        ...gameDetails,
        currentMissionCrew: newArray,
      };

      socket.emit("liveUpdateGameDetails", {
        gameDetails: updatedGameDetails,
        gameId,
      });
      setGameDetails(updatedGameDetails);
      return newArray;
    });
  };

  const handleLeaderFinalized = () => {
    setSelectionFinal(() => {
      socket.emit("finalizeSelection", gameId);
      return true;
    });
  };

  const voteApprove = (approved) => {
    setVoted(true);
    setApproves((prevArray) => {
      player = gameDetails.players.find(
        (player) => player.socketId === socket.id
      );
      console.log("P1");
      const newArray = [
        ...prevArray,
        {
          name: player.name,
          socketId: socket.id,
          role: player.role,
          votedApprove: approved,
        },
      ];
      console.log("P2");

      const updatedGameDetails = {
        ...gameDetails,
        roundApproves: newArray,
      };
      console.log("P3");

      socket.emit("liveUpdateGameDetails", {
        gameDetails: updatedGameDetails,
        gameId,
      });
      console.log("P4");

      return newArray;
    });
  };

  return (
    <View style={styles.container}>
      {/* {gameDetails &&
        console.log(
          gameDetails.players.find((player) => player.socketId === socket.id)
            .role
        )} */}
      {gameDetails && (
        <View>
          <Text>
            {
              gameDetails.players.find(
                (player) => player.socketId === socket.id
              ).role
            }
          </Text>
          <Text>{name}</Text>
        </View>
      )}
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
            {
              /* const selectedPlayer = gameDetails.players.find(
              (player) => player.socketId === 
            ); */
            }

            return socket.id === leader?.socketId ? (
              <Picker
                selectedValue={JSON.stringify(missionCrew[index])}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  handlePlayerSelection(itemValue, index)
                }
                key={index}
              >
                <Picker.Item label="Select a player" value={null} />
                {gameDetails.players.map((player) => (
                  <Picker.Item
                    key={JSON.stringify(player)}
                    label={player.name}
                    value={JSON.stringify(player)}
                  />
                ))}
              </Picker>
            ) : (
              <Text key={index} style={styles.text}>
                {missionCrew[index]
                  ? missionCrew[index].name
                  : "No selection yet"}
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
      ) : selectionFinal && !voted ? (
        <View>
          <Button
            title="Skip"
            onPress={() => {
              console.log(socket.id + " voted skip");
              voteApprove(false);
            }}
          />
          <Button
            title="Approve"
            onPress={() => {
              console.log(socket.id + " approved");
              voteApprove(true);
            }}
          />
        </View>
      ) : (
        <Text>Waiting for leader to finalize selection</Text>
      )}
      <View style={styles.voteResults}>
        {approves.map((player) => (
          <Text>{player.name}</Text>
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
