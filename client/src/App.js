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
import MissionScreen from "./screens/MissionScreen";
import RetryScreen from "./screens/RetryScreen";
import { SocketProvider } from "./SocketContext"; // Import the context provider

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ gestureEnabled: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateGame" component={CreateGameScreen} />
          <Stack.Screen name="JoinGame" component={JoinGameScreen} />
          <Stack.Screen
            name="GameLobby"
            component={GameLobbyScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="Reveal"
            component={RevealScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="RoundEnd"
            component={RoundEndScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="GameOver"
            component={GameOverScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="Mission"
            component={MissionScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
          <Stack.Screen
            name="Retry"
            component={RetryScreen}
            options={{
              headerBackVisible: false, // This removes the back button
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
};

export default App;
