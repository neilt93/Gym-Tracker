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
  Text,
  ActivityIndicator,
  Chip,
  Button,
  Modal,
  TextInput,
} from 'react-native-paper';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
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

export default function DashboardScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setEditForm({
      name: workout.name,
      startedAt: workout.startedAt,
      exerciseSets: workout.exerciseSets.map(set => ({ ...set })),
    });
    setEditModalVisible(true);
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSetChange = (idx: number, field: string, value: any) => {
    setEditForm((prev: any) => {
      const newSets = [...prev.exerciseSets];
      newSets[idx] = { ...newSets[idx], [field]: value };
      return { ...prev, exerciseSets: newSets };
    });
  };

  const handleAddSet = () => {
    setEditForm((prev: any) => ({
      ...prev,
      exerciseSets: [
        ...prev.exerciseSets,
        { exercise: { name: '', targetMuscles: [] }, weight: 0, reps: 0 },
      ],
    }));
  };

  const handleRemoveSet = (idx: number) => {
    setEditForm((prev: any) => {
      const newSets = prev.exerciseSets.filter((_: any, i: number) => i !== idx);
      return { ...prev, exerciseSets: newSets };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingWorkout) return;
    try {
      const response = await fetch(`http://10.16.67.229:3000/api/workouts/${editingWorkout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          startedAt: editForm.startedAt,
          exerciseSets: editForm.exerciseSets,
        }),
      });
      if (!response.ok) throw new Error('Failed to update workout');
      const updated = await response.json();
      setWorkouts(prev => prev.map(w => w.id === updated.id ? updated : w));
      setEditModalVisible(false);
      setEditingWorkout(null);
      setEditForm(null);
      Alert.alert('Success', 'Workout updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update workout.');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://10.16.67.229:3000/api/workouts/${workoutId}`, {
                method: 'DELETE',
              });

              if (!response.ok) throw new Error('Failed to delete workout');

              setWorkouts(prev => prev.filter(w => w.id !== workoutId));
              Alert.alert('Success', 'Workout deleted successfully!');
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const fetchData = async () => {
    try {
      const [workoutsRes, mealsRes] = await Promise.all([
        fetch('http://10.16.67.229:3000/api/workouts'),
        fetch('http://10.16.67.229:3000/api/meals'),
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
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Workout Intensity Chart Data
  const workoutIntensityData = {
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

  // Weekly Workout Frequency
  const weeklyWorkoutData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0], // Will be calculated below
    }],
  };

  // Calculate weekly workout frequency
  const now = new Date();
  const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
  const weeklyData = [0, 0, 0, 0, 0, 0, 0];

  workouts.forEach(workout => {
    const workoutDate = new Date(workout.startedAt);
    if (workoutDate >= weekStart) {
      const dayOfWeek = workoutDate.getDay();
      weeklyData[dayOfWeek]++;
    }
  });

  weeklyWorkoutData.datasets[0].data = weeklyData;

  // Muscle Group Distribution
  const muscleGroupData = {
    labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
    data: [0, 0, 0, 0, 0, 0],
  };

  // Calculate muscle group distribution
  const muscleGroups = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE'];
  workouts.forEach(workout => {
    workout.exerciseSets.forEach(set => {
      const muscleGroup = set.exercise.targetMuscles[0];
      const index = muscleGroups.indexOf(muscleGroup);
      if (index !== -1) {
        muscleGroupData.data[index]++;
      }
    });
  });

  // Nutrition Summary
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientHeader}
            >
              <Card.Content style={styles.headerContent}>
                <Title style={styles.headerTitle}>Dashboard</Title>
                <Text style={styles.headerSubtitle}>
                  Your fitness analytics and progress
                </Text>
              </Card.Content>
            </LinearGradient>
          </Card>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statNumber}>{workouts.length}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statNumber}>{meals.length}</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {workouts.reduce((total, w) => total + w.exerciseSets.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Workout Intensity Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Workout Intensity (Last 7 Days)</Title>
              <LineChart
                data={workoutIntensityData}
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
            </Card.Content>
          </Card>

          {/* Weekly Workout Frequency */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Weekly Workout Frequency</Title>
              <BarChart
                data={weeklyWorkoutData}
                width={width - 60}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={styles.chart}
              />
            </Card.Content>
          </Card>

          {/* Muscle Group Distribution */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Muscle Group Distribution</Title>
              <PieChart
                data={muscleGroupData.data.map((value, index) => ({
                  name: muscleGroupData.labels[index],
                  population: value,
                  color: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                  ][index],
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12,
                }))}
                width={width - 60}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </Card.Content>
          </Card>

          {/* Nutrition Summary */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Nutrition Summary</Title>
              <View style={styles.nutritionStats}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Total Calories</Text>
                  <Text style={styles.nutritionValue}>{totalCalories}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{totalProtein.toFixed(1)}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{totalCarbs.toFixed(1)}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{totalFat.toFixed(1)}g</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Recent Workouts */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Recent Workouts</Title>
              {workouts.slice(0, 5).map((workout, index) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDate}>
                      {new Date(workout.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.workoutStats}>
                    <Chip mode="outlined" style={styles.workoutChip}>
                      {workout.exerciseSets.length} sets
                    </Chip>
                    <View style={styles.workoutActions}>
                      <Button
                        mode="text"
                        onPress={() => handleEditWorkout(workout)}
                        style={styles.editButton}
                        icon="pencil"
                        compact
                      >
                        Edit
                      </Button>
                      <Button
                        mode="text"
                        onPress={() => handleDeleteWorkout(workout.id)}
                        style={styles.deleteButton}
                        icon="delete"
                        textColor="#FF0000"
                        compact
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </View>
              ))}
              {workouts.length === 0 && (
                <Text style={styles.emptyText}>No workouts yet</Text>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      {/* Edit Workout Modal */}
      <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 16 }}>
        <Title>Edit Workout</Title>
        <TextInput
          label="Workout Name"
          value={editForm?.name || ''}
          onChangeText={text => handleEditFormChange('name', text)}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Date"
          value={editForm?.startedAt ? new Date(editForm.startedAt).toISOString().slice(0, 10) : ''}
          onChangeText={text => handleEditFormChange('startedAt', text)}
          style={{ marginBottom: 12 }}
        />
        {editForm?.exerciseSets?.map((set: any, idx: number) => (
          <View key={idx} style={{ marginBottom: 8, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 }}>
            <TextInput
              label="Exercise Name"
              value={set.exercise.name}
              onChangeText={text => handleSetChange(idx, 'exercise', { ...set.exercise, name: text })}
              style={{ marginBottom: 4 }}
            />
            <TextInput
              label="Weight"
              value={set.weight?.toString() || ''}
              onChangeText={text => handleSetChange(idx, 'weight', parseFloat(text) || 0)}
              keyboardType="numeric"
              style={{ marginBottom: 4 }}
            />
            <TextInput
              label="Reps"
              value={set.reps?.toString() || ''}
              onChangeText={text => handleSetChange(idx, 'reps', parseInt(text) || 0)}
              keyboardType="numeric"
              style={{ marginBottom: 4 }}
            />
            <Button mode="text" onPress={() => handleRemoveSet(idx)} textColor="#FF0000">Remove Set</Button>
          </View>
        ))}
        <Button mode="outlined" onPress={handleAddSet} style={{ marginBottom: 12 }}>Add Set</Button>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={{ flex: 1, marginRight: 8 }}>Cancel</Button>
          <Button mode="contained" onPress={handleSaveEdit} style={{ flex: 1, marginLeft: 8 }}>Save</Button>
        </View>
      </Modal>
    </>
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
  headerCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientHeader: {
    padding: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  nutritionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutChip: {
    height: 24,
  },
  workoutActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
}); 