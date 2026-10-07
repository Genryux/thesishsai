import { View, Button, StyleSheet } from 'react-native';
import { Text } from '../components/Text';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ThesiSHS</Text>
      <Text style={styles.subtitle}>Student Portal</Text>
      <Button title="Go to Login" onPress={() => router.push('/login')} />
      <View style={{ height: 10 }} />
      <Button title="Skip to Dashboard" onPress={() => router.push('/dashboard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
});
