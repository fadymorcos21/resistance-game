import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useEffect } from "react/cjs/react.production.min";
import { SocketContext } from "../SocketContext";

const MissionScreen = ({ route, navigation }) => {
  const { gameId, name, leader, crew } = route.params;
  const socket = useContext(SocketContext);

  const [played, setPlayed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const handleMissionResult = ({ sabotages, spiesWin }) => {
        console.log(
          "Mission Result received: sabotages: ",
          sabotages,
          " spiesWin: ",
          spiesWin
        );

        // Navigate to the RoundEndScreen and pass sabotages and spiesWin
        navigation.navigate("RoundEnd", {
          gameId,
          name,
          sabotages,
          spiesWin,
          isSkipped: false, // Assuming not skipped unless you handle skipping elsewhere
          leader,
        });
      };

      socket.on("missionResult", handleMissionResult);

      const handlePlayerLeft = (details) => {
        navigation.navigate("Retry", { name, gameId });
      };

      socket.on("playerLeft", handlePlayerLeft);

      return () => {
        socket.off("missionResult", handleMissionResult);
        socket.off("playerLeft", handlePlayerLeft);
      };
    }, [navigation, socket, gameId, name, leader.socketId])
  );

  // Check if the socket.id is in the crew array by matching the socketId in crew objects
  const isInCrew = crew.some((member) => member.socketId === socket.id);

  // Function to handle a crew member's action (success or sabotage)
  const handleMissionAction = (action) => {
    setPlayed(true);

    // Emit the final results to the server once all crew members have played
    socket.emit("crewMemberVoted", {
      gameId,
      action,
    });
  };

  return (
    <View style={styles.container}>
      {isInCrew ? (
        !played ? (
          <View>
            <Button
              title="Success"
              onPress={() => handleMissionAction("success")}
            />
            <Button
              title="Sabotage"
              onPress={() => handleMissionAction("sabotage")}
            />
          </View>
        ) : (
          <Text style={styles.text}>Waiting for crewmates...</Text>
        )
      ) : (
        <Text style={styles.text}>Waiting for the crew...</Text>
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
});

export default MissionScreen;
