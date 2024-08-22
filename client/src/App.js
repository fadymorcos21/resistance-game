// client/src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CreateGameScreen from "./screens/CreateGameScreen";
import JoinGameScreen from "./screens/JoinGameScreen";
import GameLobbyScreen from "./screens/GameLobbyScreen";
import RevealScreen from "./screens/RevealScreen";
import GameScreen from "./screens/GameScreen";
import RoundEndScreen from "./screens/RoundEndScreen";
import GameOverScreen from "./screens/GameOverScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
        <Stack.Screen name="Reveal" component={RevealScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="RoundEnd" component={RoundEndScreen} />
        <Stack.Screen name="GameOver" component={GameOverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
