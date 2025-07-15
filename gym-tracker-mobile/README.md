# Gym Tracker iOS App

A beautiful React Native iOS app for tracking workouts, meals, and fitness progress.

## 🚀 Features

- **Workout Tracking**: Log strength training and cardio sessions
- **Meal Tracking**: Track macros and nutrition
- **Beautiful Charts**: Visualize your progress with interactive charts
- **iOS Native**: Optimized for iPhone and iPad
- **Offline Support**: Works without internet connection
- **HealthKit Integration**: Sync with Apple Health (coming soon)

## 📱 Screenshots

- Home screen with workout intensity chart
- Add workout modal with exercise and set tracking
- Dashboard with multiple chart types
- Food tracker with macro breakdown

## 🛠 Setup Instructions

### Prerequisites

1. **Install Node.js** (v18 or higher)
2. **Install Expo CLI**:
   ```bash
   npm install -g @expo/cli
   ```
3. **Install Xcode** (for iOS development)
4. **Install iOS Simulator** (comes with Xcode)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd gym-tracker-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on iOS Simulator**:
   ```bash
   npm run ios
   ```

### Development

- **Start Expo**: `npm start`
- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android`
- **Web Browser**: `npm run web`

## 📁 Project Structure

```
gym-tracker-mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home screen
│   ├── add-workout.tsx    # Add workout modal
│   ├── dashboard.tsx      # Dashboard with charts
│   └── meals.tsx          # Food tracker
├── components/            # Reusable components
├── services/             # API and data services
├── types/                # TypeScript type definitions
├── assets/               # Images, icons, fonts
└── app.json              # Expo configuration
```

## 🔧 Configuration

### API Endpoints

Update the API URLs in your components to point to your backend:

```typescript
// In your API calls, replace localhost with your server URL
const API_BASE = 'https://your-backend-url.com';

// Example:
fetch(`${API_BASE}/api/workouts`)
```

### Environment Variables

Create a `.env` file for environment variables:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
EXPO_PUBLIC_APP_NAME=Gym Tracker
```

## 📊 Charts and Data

The app uses `react-native-chart-kit` for beautiful, interactive charts:

- **Line Charts**: For progress over time
- **Bar Charts**: For workout volume and frequency
- **Doughnut Charts**: For muscle group distribution
- **Area Charts**: For weight tracking

## 🎨 UI Components

Built with `react-native-paper` for Material Design components:

- Cards with elevation and rounded corners
- Gradient backgrounds
- Smooth animations
- Native iOS feel

## 📱 iOS Features

### HealthKit Integration

The app is configured for HealthKit integration:

```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "This app uses HealthKit to track your workouts and fitness data.",
      "NSHealthUpdateUsageDescription": "This app saves your workout data to HealthKit."
    }
  }
}
```

### App Store Deployment

1. **Build for production**:
   ```bash
   expo build:ios
   ```

2. **Submit to App Store**:
   ```bash
   expo submit:ios
   ```

## 🔄 Data Flow

1. **API Integration**: Connects to your existing Next.js backend
2. **Local Storage**: Uses AsyncStorage for offline data
3. **Real-time Updates**: Fetches fresh data on app launch
4. **Error Handling**: Graceful fallbacks for network issues

## 🚀 Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Image Optimization**: Compressed assets
- **Memory Management**: Proper cleanup in useEffect
- **Smooth Animations**: 60fps interactions

## 🧪 Testing

```bash
# Run tests
npm test

# Run on device
expo start --tunnel
```

## 📈 Analytics

Track app usage with Expo Analytics:

```bash
expo analytics:view
```

## 🔐 Security

- HTTPS API calls
- Input validation
- Secure storage for sensitive data
- Privacy-compliant data handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Expo Docs](https://docs.expo.dev/)
- **React Native**: [RN Docs](https://reactnative.dev/)
- **Issues**: Create an issue in this repository

## 🎯 Roadmap

- [ ] HealthKit integration
- [ ] Apple Watch companion app
- [ ] Push notifications
- [ ] Social features
- [ ] Advanced analytics
- [ ] Custom workout templates
- [ ] Voice commands
- [ ] AR workout guidance

---

**Built with ❤️ using React Native and Expo** 