import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Workout {
  id: string;
  name: string;
  startedAt: string;
  exerciseSets: {
    exercise: {
      name: string;
      targetMuscles: string[];
    };
    weight: number;
    reps: number;
    rpe?: number;
    duration?: number;
    intensity?: number;
  }[];
}

interface Meal {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  timestamp: string;
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workoutsRes, mealsRes] = await Promise.all([
        fetch('http://localhost:3000/api/workouts'),
        fetch('http://localhost:3000/api/meals'),
      ]);
      
      if (!workoutsRes.ok || !mealsRes.ok) throw new Error('Failed to fetch data');
      
      const [workoutsData, mealsData] = await Promise.all([
        workoutsRes.json(),
        mealsRes.json(),
      ]);
      
      setWorkouts(workoutsData);
      setMeals(mealsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: workouts.slice(-7).map(w => new Date(w.startedAt).toLocaleDateString()),
    datasets: [{
      data: workouts.slice(-7).map(workout => 
        workout.exerciseSets.reduce((total, set) => {
          if (set.duration && set.intensity) {
            return total + (set.duration * set.intensity);
          }
          return total + (set.weight * set.reps);
        }, 0)
      ),
    }],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your fitness data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Workout Intensity Chart */}
        <Card style={styles.card} onPress={() => router.push('/dashboard')}>
          <Card.Content>
            <Title style={styles.cardTitle}>Workout Intensity</Title>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={width - 60}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#667eea',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Action Cards */}
        <View style={styles.actionCards}>
          {/* Add Workout Card */}
          <Card style={[styles.actionCard, styles.workoutCard]} onPress={() => router.push('/add-workout')}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientCard}
            >
              <Card.Content style={styles.actionCardContent}>
                <Title style={styles.actionCardTitle}>Add Workout</Title>
                <Paragraph style={styles.actionCardText}>
                  Track your strength training and cardio sessions
                </Paragraph>
                <Text style={styles.emoji}>💪</Text>
              </Card.Content>
            </LinearGradient>
          </Card>

          {/* Food Tracker Card */}
          <Card style={[styles.actionCard, styles.foodCard]} onPress={() => router.push('/meals')}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.gradientCard}
            >
              <Card.Content style={styles.actionCardContent}>
                <Title style={styles.actionCardTitle}>Food Tracker</Title>
                <Paragraph style={styles.actionCardText}>
                  Track your meals and macros
                </Paragraph>
                <Text style={styles.emoji}>🍎</Text>
              </Card.Content>
            </LinearGradient>
          </Card>
        </View>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Quick Stats</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{workouts.length}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{meals.length}</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {workouts.reduce((total, w) => total + w.exerciseSets.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  workoutCard: {
    marginRight: 8,
  },
  foodCard: {
    marginLeft: 8,
  },
  gradientCard: {
    padding: 16,
  },
  actionCardContent: {
    alignItems: 'center',
  },
  actionCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionCardText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  emoji: {
    fontSize: 32,
    marginTop: 8,
  },
  statsCard: {
    elevation: 4,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 