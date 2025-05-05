import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import AIAssistant from '../components/AIAssistant';
import Text from '../components/Text';

export default function TestPronunciationScreen() {
  const handlePronounce = (word: string, score: number) => {
    console.log('Pronunciation result for word:', word);
    console.log('Score:', score);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      <Text style={styles.title}>Test Pronunciation</Text>
      <Text style={styles.subtitle}>Try pronouncing these words:</Text>
      
      <AIAssistant 
        words={['hello', 'world', 'computer', 'learning']}
        onPronounce={handlePronounce}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});
