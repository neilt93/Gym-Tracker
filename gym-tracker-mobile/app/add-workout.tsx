import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const TEST_USER_ID = '0';

const MUSCLE_GROUPS = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'FULL_BODY',
] as const;

const WORKOUT_TYPES = [
  'STRENGTH',
  'CARDIO',
  'HIIT',
  'FLEXIBILITY',
  'RECOVERY',
] as const;

interface Set {
  reps: number;
  weight: number;
  rpe: number | null;
  duration?: number; // for cardio
  intensity?: number; // for cardio (1-10 scale)
}

interface Exercise {
  exerciseName: string;
  muscleGroup: string;
  workoutType: string;
  sets: Set[];
}

export default function AddWorkoutScreen() {
  const [loading, setLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      exerciseName: '',
      muscleGroup: '',
      workoutType: 'STRENGTH',
      sets: [{ reps: 0, weight: 0, rpe: null }],
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: '',
        muscleGroup: '',
        workoutType: 'STRENGTH',
        sets: [{ reps: 0, weight: 0, rpe: null }],
      },
    ]);
  };

  const deleteExercise = (exerciseIndex: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, index) => index !== exerciseIndex));
    }
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter(
        (_, index) => index !== setIndex
      );
      setExercises(newExercises);
    }
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const isCardio = exercise.workoutType === 'CARDIO';

    if (isCardio) {
      exercise.sets.push({
        reps: 0,
        weight: 0,
        rpe: null,
        duration: 0,
        intensity: 5,
      });
    } else {
      exercise.sets.push({ reps: 0, weight: 0, rpe: null });
    }
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };

    // If workout type changed to cardio, update the sets
    if (field === 'workoutType' && value === 'CARDIO') {
      newExercises[index].sets = newExercises[index].sets.map((set) => ({
        ...set,
        duration: set.duration || 0,
        intensity: set.intensity || 5,
      }));
    } else if (field === 'workoutType' && value === 'STRENGTH') {
      newExercises[index].sets = newExercises[index].sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe,
      }));
    }

    setExercises(newExercises);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number | null
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: TEST_USER_ID,
        name: workoutName,
        startedAt: new Date().toISOString(),
        exerciseSets: exercises.flatMap((exercise, exerciseIndex) =>
          exercise.sets.map((set, setIndex) => ({
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            workoutType: exercise.workoutType,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            duration: set.duration,
            intensity: set.intensity,
            setIndex: setIndex + 1,
          }))
        ),
      };

      const response = await fetch('http://10.16.67.229:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('API error');

      Alert.alert('Success', 'Workout saved successfully!');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Add Workout</Title>

              {/* Workout Name */}
              <TextInput
                label="Workout Name"
                value={workoutName}
                onChangeText={setWorkoutName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Push Day"
              />

              {/* Exercises */}
              {exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseContainer}>
                  <Divider style={styles.divider} />
                  <View style={styles.exerciseHeader}>
                    <Title style={styles.exerciseTitle}>
                      Exercise {exerciseIndex + 1}
                    </Title>
                    {exercises.length > 1 && (
                      <Button
                        mode="contained"
                        onPress={() => deleteExercise(exerciseIndex)}
                        style={styles.deleteButton}
                        buttonColor="#ef4444"
                      >
                        Delete
                      </Button>
                    )}
                  </View>

                  {/* Exercise Name */}
                  <TextInput
                    label="Exercise Name"
                    value={exercise.exerciseName}
                    onChangeText={(text) =>
                      updateExercise(exerciseIndex, 'exerciseName', text)
                    }
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Bench Press"
                  />

                  {/* Workout Type */}
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Workout Type</Text>
                    <View style={styles.chipContainer}>
                      {WORKOUT_TYPES.map((type) => (
                        <Chip
                          key={type}
                          selected={exercise.workoutType === type}
                          onPress={() =>
                            updateExercise(exerciseIndex, 'workoutType', type)
                          }
                          style={styles.chip}
                          mode="outlined"
                        >
                          {type}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  {/* Muscle Group */}
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Muscle Group</Text>
                    <View style={styles.chipContainer}>
                      {MUSCLE_GROUPS.map((group) => (
                        <Chip
                          key={group}
                          selected={exercise.muscleGroup === group}
                          onPress={() =>
                            updateExercise(exerciseIndex, 'muscleGroup', group)
                          }
                          style={styles.chip}
                          mode="outlined"
                        >
                          {group}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  {/* Sets */}
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setContainer}>
                      <View style={styles.setHeader}>
                        <Text style={styles.setTitle}>Set {setIndex + 1}</Text>
                        {exercise.sets.length > 1 && (
                          <Button
                            mode="text"
                            onPress={() => deleteSet(exerciseIndex, setIndex)}
                            textColor="#ef4444"
                            compact
                          >
                            Delete
                          </Button>
                        )}
                      </View>

                      {exercise.workoutType === 'CARDIO' ? (
                        // Cardio set fields
                        <View style={styles.setFields}>
                          <TextInput
                            label="Duration (minutes)"
                            value={set.duration?.toString() || ''}
                            onChangeText={(text) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                'duration',
                                parseFloat(text) || 0
                              )
                            }
                            mode="outlined"
                            style={styles.halfInput}
                            keyboardType="numeric"
                          />
                          <TextInput
                            label="Intensity (1-10)"
                            value={set.intensity?.toString() || ''}
                            onChangeText={(text) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                'intensity',
                                parseFloat(text) || 0
                              )
                            }
                            mode="outlined"
                            style={styles.halfInput}
                            keyboardType="numeric"
                          />
                        </View>
                      ) : (
                        // Strength set fields
                        <View style={styles.setFields}>
                          <TextInput
                            label="Reps"
                            value={set.reps.toString()}
                            onChangeText={(text) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                'reps',
                                parseInt(text) || 0
                              )
                            }
                            mode="outlined"
                            style={styles.thirdInput}
                            keyboardType="numeric"
                          />
                          <TextInput
                            label="Weight (lbs)"
                            value={set.weight.toString()}
                            onChangeText={(text) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                parseFloat(text) || 0
                              )
                            }
                            mode="outlined"
                            style={styles.thirdInput}
                            keyboardType="numeric"
                          />
                          <TextInput
                            label="RPE"
                            value={set.rpe?.toString() || ''}
                            onChangeText={(text) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                'rpe',
                                text ? parseFloat(text) : null
                              )
                            }
                            mode="outlined"
                            style={styles.thirdInput}
                            keyboardType="numeric"
                          />
                        </View>
                      )}
                    </View>
                  ))}

                  <Button
                    mode="outlined"
                    onPress={() => addSet(exerciseIndex)}
                    style={styles.addSetButton}
                  >
                    Add Set
                  </Button>
                </View>
              ))}

              <Button
                mode="outlined"
                onPress={addExercise}
                style={styles.addExerciseButton}
                icon="plus"
              >
                Add Exercise
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
                loading={loading}
              >
                {loading ? 'Saving...' : 'Save Workout'}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  divider: {
    marginVertical: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    borderRadius: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  setContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  setFields: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  addSetButton: {
    marginTop: 8,
  },
  addExerciseButton: {
    marginTop: 16,
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#667eea',
  },
}); 