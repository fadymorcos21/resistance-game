// client/src/screens/JoinGameScreen.js
import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';

const JoinGameScreen = ({ navigation }) => {
  const [PIN, setPIN] = useState('');


  return (
    <View style={styles.container}>
        <Text style={styles.title}>Resistance</Text>
      <Text style={styles.subtitle}>(The App)</Text>
      <Text style={styles.auther}>By Fady</Text>
      <TextInput
        style={styles.input}
        placeholder="Game PIN"
        value={PIN}
        onChangeText={(e) => {
          // Placeholder for joining a game
          setPIN(e);
          console.log("GAME PIN: " + e);
        }}
      />
      <Button title="Join Game" onPress={() => navigation.goBack()} />
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

export default JoinGameScreen;