// client/src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/app";
import CreateGameScreen from "./src/app/CreateGameScreen";
import JoinGameScreen from "./src/app/JoinGameScreen";
import GameLobbyScreen from "./src/app/GameLobbyScreen";
import RevealScreen from "./src/app/RevealScreen";
import GameScreen from "./src/app/GameScreen";
import RoundEndScreen from "./src/app/RoundEndScreen";
import GameOverScreen from "./src/app/GameOverScreen";
import MissionScreen from "./src/app/MissionScreen";
import RetryScreen from "./src/app/RetryScreen";
import { SocketProvider } from "./src/SocketContext"; // Import the context provider
import * as Sentry from "@sentry/react-native";
import { AppLoading } from "expo";

Sentry.init({
  dsn: "https://fca2b43110c8ac9d07da57d993efe2ed@o4508060621209600.ingest.us.sentry.io/4508060623568896", // Replace with your actual DSN from Sentry
  enableInExpoDevelopment: true,
  debug: true,
});

Sentry.captureMessage("Sentry is set up correctly!");

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ gestureEnabled: false }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }} // Hide header for HomeScreen
          />
          <Stack.Screen name="CreateGame" component={CreateGameScreen} />
          <Stack.Screen
            name="JoinGame"
            component={JoinGameScreen}
            options={{ title: "" }}
          />
          <Stack.Screen
            name="GameLobby"
            component={GameLobbyScreen}
            options={{
              headerBackVisible: false, // This removes the back button
              title: "Game Lobby",
            }}
          />
          <Stack.Screen
            name="Reveal"
            component={RevealScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RoundEnd"
            component={RoundEndScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GameOver"
            component={GameOverScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Mission"
            component={MissionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Retry"
            component={RetryScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
};

export default App;
