import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  FAB,
  Modal,
  Portal,
  Chip,
} from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const TEST_USER_ID = '0';

interface Meal {
  id: string;
  name: string;
  image: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  timestamp: string;
}

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: '',
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch('http://10.16.67.229:3000/api/meals');
      if (!response.ok) throw new Error('Failed to fetch meals');
      const mealsData = await response.json();
      setMeals(mealsData);
    } catch (err) {
      console.error('Error fetching meals:', err);
      Alert.alert('Error', 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSelectedImage(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://10.16.67.229:3000/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImage || '',
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0,
          calories: formData.calories ? parseInt(formData.calories) : calculateTotalCalories(
            parseFloat(formData.protein) || 0,
            parseFloat(formData.carbs) || 0,
            parseFloat(formData.fat) || 0
          ),
        }),
      });

      if (!response.ok) throw new Error('Failed to add meal');

      const newMeal = await response.json();
      setMeals(prev => [newMeal, ...prev]);
      
      // Reset form
      setFormData({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
        calories: '',
      });
      setSelectedImage(null);
      setModalVisible(false);
      
      Alert.alert('Success', 'Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalCalories = (protein: number, carbs: number, fat: number) => {
    return protein * 4 + carbs * 4 + fat * 9;
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      calories: meal.calories.toString(),
    });
    setSelectedImage(meal.image || null);
    setModalVisible(true);
  };

  const handleUpdateMeal = async () => {
    if (!editingMeal || !formData.name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://10.16.67.229:3000/api/meals/${editingMeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImage || '',
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0,
          calories: formData.calories ? parseInt(formData.calories) : calculateTotalCalories(
            parseFloat(formData.protein) || 0,
            parseFloat(formData.carbs) || 0,
            parseFloat(formData.fat) || 0
          ),
        }),
      });

      if (!response.ok) throw new Error('Failed to update meal');

      const updatedMeal = await response.json();
      setMeals(prev => prev.map(m => m.id === editingMeal.id ? updatedMeal : m));
      
      // Reset form
      setFormData({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
        calories: '',
      });
      setSelectedImage(null);
      setEditingMeal(null);
      setModalVisible(false);
      
      Alert.alert('Success', 'Meal updated successfully!');
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://10.16.67.229:3000/api/meals/${mealId}`, {
                method: 'DELETE',
              });

              if (!response.ok) throw new Error('Failed to delete meal');

              setMeals(prev => prev.filter(m => m.id !== mealId));
              Alert.alert('Success', 'Meal deleted successfully!');
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading meals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Header */}
          <Card style={styles.headerCard}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.gradientHeader}
            >
              <Card.Content style={styles.headerContent}>
                <Title style={styles.headerTitle}>Food Tracker</Title>
                <Text style={styles.headerSubtitle}>
                  Track your meals and macros
                </Text>
                <Text style={styles.mealCount}>{meals.length} meals logged</Text>
              </Card.Content>
            </LinearGradient>
          </Card>



          {/* Meals List */}
          {meals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>

                <Title style={styles.emptyTitle}>No meals yet</Title>
                <Text style={styles.emptyText}>
                  Start tracking your nutrition by adding your first meal!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            meals.map((meal) => (
              <Card key={meal.id} style={styles.mealCard}>
                <Card.Content>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealInfo}>
                      <Title style={styles.mealName}>{meal.name}</Title>
                      <Text style={styles.mealDate}>
                        {new Date(meal.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.mealActions}>
                      {meal.image && (
                        <Image
                          source={{ uri: meal.image }}
                          style={styles.mealImage}
                        />
                      )}
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          onPress={() => handleEditMeal(meal)}
                          style={styles.editButton}
                          icon="pencil"
                        >
                          Edit
                        </Button>
                        <Button
                          mode="text"
                          onPress={() => handleDeleteMeal(meal.id)}
                          style={styles.deleteButton}
                          icon="delete"
                          textColor="#FF0000"
                        >
                          Delete
                        </Button>
                      </View>
                    </View>
                  </View>

                  <View style={styles.macroContainer}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{meal.protein}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{meal.carbs}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroValue}>{meal.fat}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={styles.macroValue}>{meal.calories}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Meal FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* Add Meal Modal */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Card style={styles.modalCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Card.Content>
                    <Title style={styles.modalTitle}>{editingMeal ? 'Edit Meal' : 'Add Meal'}</Title>

                    {/* Meal Name */}
                    <TextInput
                      label="Meal Name"
                      value={formData.name}
                      onChangeText={(text) => handleInputChange('name', text)}
                      mode="outlined"
                      style={styles.input}
                      placeholder="e.g., Grilled Chicken Salad"
                    />

                    {/* Macros */}
                    <View style={styles.macroInputs}>
                      <TextInput
                        label="Protein (g)"
                        value={formData.protein}
                        onChangeText={(text) => handleInputChange('protein', text)}
                        mode="outlined"
                        style={styles.macroInput}
                        keyboardType="numeric"
                      />
                      <TextInput
                        label="Carbs (g)"
                        value={formData.carbs}
                        onChangeText={(text) => handleInputChange('carbs', text)}
                        mode="outlined"
                        style={styles.macroInput}
                        keyboardType="numeric"
                      />
                      <TextInput
                        label="Fat (g)"
                        value={formData.fat}
                        onChangeText={(text) => handleInputChange('fat', text)}
                        mode="outlined"
                        style={styles.macroInput}
                        keyboardType="numeric"
                      />
                      <TextInput
                        label="Calories"
                        value={formData.calories}
                        onChangeText={(text) => handleInputChange('calories', text)}
                        mode="outlined"
                        style={styles.macroInput}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Calculated Calories - Only show if no manual calories entered */}
                    {formData.protein && formData.carbs && formData.fat && !formData.calories && (
                      <View style={styles.calculatedCalories}>
                        <Text style={styles.calculatedLabel}>Calculated Calories:</Text>
                        <Text style={styles.calculatedValue}>
                          {calculateTotalCalories(
                            parseFloat(formData.protein) || 0,
                            parseFloat(formData.carbs) || 0,
                            parseFloat(formData.fat) || 0
                          )}
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          setModalVisible(false);
                          setEditingMeal(null);
                          setFormData({
                            name: '',
                            protein: '',
                            carbs: '',
                            fat: '',
                            calories: '',
                          });
                          setSelectedImage(null);
                        }}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={editingMeal ? handleUpdateMeal : handleSubmit}
                        disabled={submitting}
                        style={styles.submitButton}
                        loading={submitting}
                      >
                        {submitting ? (editingMeal ? 'Updating...' : 'Adding...') : (editingMeal ? 'Update Meal' : 'Add Meal')}
                      </Button>
                    </View>
                  </Card.Content>
                </ScrollView>
              </Card>
            </View>
          </View>
        </View>
      )}
    </View>
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
  mealCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  mealCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealActions: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mealDate: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    zIndex: 1000,
    elevation: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalCard: {
    elevation: 8,
    borderRadius: 12,
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  imageButton: {
    marginBottom: 12,
  },
  selectedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  macroInputs: {
    marginBottom: 12,
  },
  macroInput: {
    marginBottom: 8,
  },
  calculatedCalories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculatedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calculatedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 44,
  },
  submitButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#4CAF50',
  },
}); 