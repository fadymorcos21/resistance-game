// client/src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import CreateGameScreen from "./src/screens/CreateGameScreen";
import JoinGameScreen from "./src/screens/JoinGameScreen";
import GameLobbyScreen from "./src/screens/GameLobbyScreen";
import RevealScreen from "./src/screens/RevealScreen";
import GameScreen from "./src/screens/GameScreen";
import RoundEndScreen from "./src/screens/RoundEndScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import MissionScreen from "./src/screens/MissionScreen";
import RetryScreen from "./src/screens/RetryScreen";
import { SocketProvider } from "./src/SocketContext"; // Import the context provider

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
