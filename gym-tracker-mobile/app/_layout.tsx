import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Gym Tracker',
              headerStyle: {
                backgroundColor: '#667eea',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }} 
          />
          <Stack.Screen 
            name="add-workout" 
            options={{ 
              title: 'Add Workout',
              presentation: 'modal',
            }} 
          />
          <Stack.Screen 
            name="dashboard" 
            options={{ 
              title: 'Dashboard',
            }} 
          />
          <Stack.Screen 
            name="meals" 
            options={{ 
              title: 'Food Tracker',
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </PaperProvider>
    </GestureHandlerRootView>
  );
} 