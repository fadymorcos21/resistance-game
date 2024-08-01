// client/src/screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resistance</Text>
      <Text style={styles.subtitle}>(The App)</Text>
      <Text style={styles.auther}>By Fady</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={(e) => {
          // Placeholder for joining a game
          setName(e);
          console.log(e);
        }}
      />
      <Button
        title="Create Game"
        onPress={() => {
          // Placeholder for creating a game
          console.log('Creating a game...');
          navigation.navigate('CreateGame');
        }}
      />
      <Button
        title="Join Game"
        onPress={() => {
          // Placeholder for joining a game
          console.log('Joining a game...');
          navigation.navigate('JoinGame');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 200
  },
  title: {
    fontSize: 34,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  auther: {
    fontSize: 15,
    marginBottom: 70,
  },
  input: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  }
});

export default HomeScreen;