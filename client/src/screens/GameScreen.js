import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";

const GameScreen = ({ route, navigation }) => {
  const { socket, gameId, name } = route.params;
  const [missionNumber, setMissionNumber] = useState(null);
  const [missionCrew, setMissionCrew] = useState([]);
  const [approves, setApproves] = useState([]);
  const [gameDetails, setGameDetails] = useState(null);
  const [leader, setLeader] = useState(null);
  const [selectionFinal, setSelectionFinal] = useState(false);
  const [voted, setVoted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState([]);
  const [dropdownValues, setDropdownValues] = useState([]);

  const missionTeamRequirements = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
  };

  useFocusEffect(
    useCallback(() => {
      setMissionNumber(null);
      setMissionCrew([]);
      setApproves([]);
      setGameDetails(null);
      setLeader(null);
      setSelectionFinal(false);
      setVoted(false);

      socket.emit("requestGameDetails", { gameId });

      socket.on("gameDetails", (details) => {
        setGameDetails(details);

        setMissionNumber(details.roundNum);
        setApproves(details.roundApproves);
        setLeader(details.roundLeader);

        if (details.currentMissionCrew.length === 0) {
          const initialMissionCrew = Array(
            missionTeamRequirements[details.numberOfPlayers][
              details.roundNum - 1
            ]
          ).fill(null);
          setMissionCrew(initialMissionCrew);

          details.currentMissionCrew = initialMissionCrew;

          socket.emit("updateGameDetails", { details, gameId });
        } else {
          setMissionCrew(details.currentMissionCrew);
          setDropdownValues(
            details.currentMissionCrew.map((player) =>
              player ? JSON.stringify(player) : null
            )
          );
        }
      });

      const checkSpyWin = (details) => {
        let spyCount = 0;
        const numOfPlayers = details.numberOfPlayers;
        for (let i = 0; i < details.currentMissionCrew.length; i++) {
          if (details.currentMissionCrew[i].role === "Spy") {
            spyCount++;
          }
        }
        if (missionNumber >= 4 && numOfPlayers >= 7 && spyCount >= 2) {
          navigation.navigate("RoundEnd", {
            socket,
            gameId,
            name,
            spiesWin: true,
            numberOfSpies: spyCount,
            leader: details.roundLeader,
          });
        } else if (spyCount > 0) {
          navigation.navigate("RoundEnd", {
            socket,
            gameId,
            name,
            spiesWin: true,
            numberOfSpies: spyCount,
            leader: details.roundLeader,
          });
        } else {
          navigation.navigate("RoundEnd", {
            socket,
            gameId,
            name,
            spiesWin: false,
            numberOfSpies: 0,
            leader: details.roundLeader,
          });
        }
      };

      const handleLiveUpdate = (details) => {
        setGameDetails(details);
        setMissionNumber(details.roundNum);
        setApproves(details.roundApproves);
        setLeader(details.roundLeader);
        setMissionCrew(details.currentMissionCrew);
        setDropdownValues(
          details.currentMissionCrew.map((player) =>
            player ? JSON.stringify(player) : null
          )
        );

        if (details.roundApproves.length + 1 >= details.numberOfPlayers) {
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
        socket.off("selectionFinal");
      };
    }, [socket, gameId, navigation])
  );

  useEffect(() => {
    if (gameDetails && missionNumber) {
      const openArray = Array(
        missionTeamRequirements[gameDetails.numberOfPlayers][missionNumber - 1]
      ).fill(false);
      const valuesArray = Array(
        missionTeamRequirements[gameDetails.numberOfPlayers][missionNumber - 1]
      ).fill(null);
      setOpenDropdown(openArray);
      setDropdownValues(valuesArray);
    }
  }, [gameDetails, missionNumber]);

  const handlePlayerSelection = (value, ind) => {
    const player = JSON.parse(value);
    setDropdownValues((prev) => {
      const newValues = [...prev];
      newValues[ind] = value;
      return newValues;
    });

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
      const newArray = [
        ...prevArray,
        {
          name: player.name,
          socketId: socket.id,
          role: player.role,
          votedApprove: approved,
        },
      ];

      const updatedGameDetails = {
        ...gameDetails,
        roundApproves: newArray,
      };

      socket.emit("liveUpdateGameDetails", {
        gameDetails: updatedGameDetails,
        gameId,
      });

      return newArray;
    });
  };

  return (
    <View style={styles.container}>
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
            const items = gameDetails.players.map((player) => ({
              label: player.name,
              value: JSON.stringify(player),
            }));

            return socket.id === leader?.socketId ? (
              <View
                key={index}
                style={{ zIndex: 1000 - index, marginBottom: 40 }}
              >
                <DropDownPicker
                  open={openDropdown[index]} // Controls whether the dropdown is open
                  value={
                    missionCrew[index]
                      ? JSON.stringify(missionCrew[index])
                      : null
                  } // Reflect the current selection from missionCrew
                  items={items} // List of selectable options
                  setOpen={(open) => {
                    setOpenDropdown((prev) =>
                      prev.map((o, i) => (i === index ? open : o))
                    );
                  }}
                  setValue={(callback) => {
                    const selectedValue = callback(
                      missionCrew[index]
                        ? JSON.stringify(missionCrew[index])
                        : null
                    );
                    handlePlayerSelection(selectedValue, index);
                  }}
                  zIndex={1000 - index}
                  dropDownDirection="BOTTOM"
                  avoidScrollView={true}
                />
              </View>
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
            handleLeaderFinalized();
          }}
        />
      ) : selectionFinal && !voted ? (
        <View>
          <Button
            title="Skip"
            onPress={() => {
              voteApprove(false);
            }}
          />
          <Button
            title="Approve"
            onPress={() => {
              voteApprove(true);
            }}
          />
        </View>
      ) : (
        <Text>Waiting for leader to finalize selection</Text>
      )}
      <View style={styles.voteResults}>
        {approves.map((player) => (
          <Text key={player.socketId}>{player.name}</Text>
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
});

export default GameScreen;
