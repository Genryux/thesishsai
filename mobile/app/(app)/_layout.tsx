import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create-research" options={{ presentation: 'transparentModal', animation: 'none' }} />
      <Stack.Screen name="project/[id]" />
    </Stack>
  );
}
