import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D60E8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDF1F5' }
});
