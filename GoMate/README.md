# 🚀 GoMate - Your Travel Companion App

<div align="center">

![GoMate](https://img.shields.io/badge/GoMate-Travel%20App-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)

**A modern, feature-rich travel booking application built with React Native and Expo**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure)

</div>

---

## 📱 About GoMate

GoMate is a comprehensive travel and transport booking application that helps users discover, book, and manage their travel journeys. With a beautiful, intuitive interface and powerful features, GoMate makes travel planning effortless.

### ✨ Key Highlights

- 🎨 **Beautiful UI/UX** - Travel-themed interface with smooth animations
- 🌓 **Dark Mode** - Complete dark mode support throughout the app
- 🔔 **Smart Notifications** - Booking confirmations & departure reminders
- ⭐ **Favorites System** - Save and manage your favorite routes
- 📱 **Responsive Design** - Works seamlessly on all screen sizes
- 🔐 **Secure Authentication** - User registration and login with validation
- 💾 **Offline Support** - AsyncStorage for local data persistence

---

## 🎯 Features

### Core Features

#### 🔐 **Authentication System**
- User registration with form validation (Formik + Yup)
- Secure login with username/password
- AsyncStorage for persistent authentication
- Profile management with avatar customization
- Local and remote authentication support

#### 🏠 **Home Screen**
- Dynamic transport item list from API
- Beautiful card-based layout with images
- Real-time transport information
- Search and filter functionality
- Interactive transport cards with animations

#### ⭐ **Favorites Management**
- Mark transport routes as favorites
- Dedicated Favorites screen
- Quick access to saved routes
- Persistent storage with AsyncStorage
- One-tap favorite toggling

#### 📅 **Booking System**
- Complete booking flow
- Booking confirmations with unique codes
- Recent bookings history
- Booking details view
- Schedule management

#### 👤 **Profile Management**
- Edit profile information
- Custom avatar picker (emoji or image)
- View booking history
- Notification preferences
- Theme settings

### 🎁 Bonus Features

#### 🌙 **Dark Mode**
- System-wide dark mode toggle
- Persistent theme preference
- Smooth theme transitions
- All screens fully optimized

#### 🔔 **Push Notifications**
- **Booking Confirmations** - Instant alerts on successful bookings
- **Departure Reminders** - 30-minute pre-departure notifications
- **Welcome Messages** - Greet new users
- **Favorite Alerts** - Feedback when adding favorites
- **User Preferences** - Granular notification controls
- **Scheduled Notifications** - View and manage upcoming alerts

#### 🎨 **Enhanced UI/UX**
- Custom splash screen with animations
- Gradient backgrounds throughout
- Smooth page transitions
- Interactive buttons with haptic feedback
- Loading states and error handling
- Travel-themed icons and imagery

---

## 🛠 Tech Stack

### Core Technologies
- **React Native** - Cross-platform mobile development
- **Expo** (SDK 52) - Development platform
- **Redux Toolkit** - State management
- **React Navigation** - Navigation and routing

### Key Libraries
- **Formik** - Form handling
- **Yup** - Schema validation
- **AsyncStorage** - Local storage
- **expo-notifications** - Push notifications
- **expo-linear-gradient** - Gradient effects
- **expo-image-picker** - Image selection
- **@expo/vector-icons** (Feather) - Icon library

### Architecture & Patterns
- Redux Toolkit for state management
- Async Thunks for API calls
- Component-based architecture
- Feature-based folder structure
- Separation of concerns (API, Redux, UI)

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/InduminiDeAlwis/GoMate.git
   cd GoMate/GoMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

---

## 🚀 Usage

### First Time Setup

1. **Launch the app** - You'll see the custom splash screen
2. **Register** - Create a new account with username and password
3. **Login** - Sign in with your credentials
4. **Explore** - Browse available transport options
5. **Book** - Select a transport and complete booking
6. **Manage** - View bookings, add favorites, customize profile

### Key User Flows

#### Making a Booking
```
Home Screen → Select Transport → View Details → Book Now → Confirmation
```

#### Managing Favorites
```
Home/Details Screen → Tap Heart Icon → View in Favorites Tab
```

#### Setting Up Notifications
```
Profile → Preferences → Enable/Disable Notification Types
```

#### Switching Theme
```
Profile → Preferences → Toggle Dark Mode
```

---

## 📁 Project Structure

```
GoMate/
├── App.js                      # Root component with Redux Provider
├── app/                        # Expo Router (navigation)
│   ├── _layout.tsx
│   ├── modal.tsx
│   └── (tabs)/
├── src/
│   ├── api/                    # API integration
│   │   └── transportApi.js     # Transport data API
│   ├── components/             # Reusable components
│   │   ├── ItemCard.js         # Transport item card
│   │   ├── themed-view.tsx     # Themed container
│   │   └── themed-text.tsx     # Themed text component
│   ├── redux/                  # State management
│   │   ├── store.js            # Redux store configuration
│   │   ├── authSlice.js        # Authentication state
│   │   ├── itemsSlice.js       # Transport items & favorites
│   │   ├── bookingsSlice.js    # Booking management
│   │   └── themeSlice.js       # Theme state
│   ├── screens/                # App screens
│   │   ├── LoginScreen.js      # Login interface
│   │   ├── RegisterScreen.js   # Registration interface
│   │   ├── SplashScreen.js     # Custom splash screen
│   │   ├── HomeScreen.js       # Main transport list
│   │   ├── DetailsScreen.js    # Transport details
│   │   ├── FavoritesScreen.js  # Favorites list
│   │   ├── RecentBookingsScreen.js  # Booking history
│   │   └── ProfileScreen.js    # User profile
│   └── services/               # Business logic
│       └── notificationService.js  # Push notifications
├── assets/                     # Images, fonts, etc.
├── constants/                  # App constants
├── package.json
└── README.md
```

---


## 🔔 Notification System

GoMate includes a comprehensive push notification system. See [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) for detailed documentation.

### Notification Types
- ✅ Booking confirmations (immediate)
- ⏰ Departure reminders (30 min before)
- 🎉 Welcome messages (new users)
- ❤️ Favorite alerts (when adding favorites)
- ⚠️ Delay notifications (template ready)

### User Controls
- Master notification toggle
- Individual type toggles
- View scheduled notifications
- Persistent preferences

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login with credentials
- [ ] Browse transport items
- [ ] Add/remove favorites
- [ ] Make a booking
- [ ] View booking history
- [ ] Toggle dark mode
- [ ] Edit profile
- [ ] Change notification preferences
- [ ] Test on different screen sizes

### Testing Notifications

**Note:** Push notifications require a physical device or development build.

```bash
# Create development build
npx expo run:android
# or
npx expo run:ios
```

---

## 📱 Screenshots

*App screens showcasing the beautiful UI:*
- 🎨 Custom Splash Screen with animations
- 🔐 Login & Registration with travel theme
- 🏠 Home screen with transport cards
- 📝 Details screen with booking option
- ⭐ Favorites screen
- 📅 Bookings history
- 👤 Profile with settings
- 🌓 Dark mode support

---

## 🔧 Configuration

### Environment Variables
The app uses mock data by default. For production:
1. Get a Transport API key from [TransportAPI](https://www.transportapi.com/)
2. Update `src/api/transportApi.js` with your API key
3. Configure notification settings in `src/services/notificationService.js`

### Customization
- **Theme Colors**: Edit `src/constants/theme.ts`
- **API Endpoints**: Modify `src/api/transportApi.js`
- **Notification Timing**: Adjust in `src/services/notificationService.js`

---

## 🐛 Known Issues & Limitations

1. **Push Notifications**: Limited support in Expo Go (SDK 53+). Use development build for full functionality.
2. **API Quota**: Using mock data when API quota exceeded.
3. **Image Picker**: Requires permissions on first use.

---

## 🚀 Future Enhancements

- [ ] Real-time tracking
- [ ] Payment integration
- [ ] Trip planning with multiple stops
- [ ] Social features (share trips)
- [ ] Offline map support
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Analytics integration

---

## 👨‍💻 Development

### Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
npm test           # Run tests
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Follow React Native best practices

---

## 📄 License

This project was created for educational purposes.

---

## 🤝 Contributing

This is a student project. For issues or suggestions, please open an issue on GitHub.

---

## 👤 Author

**Indumini De Alwis**

- GitHub: [@InduminiDeAlwis](https://github.com/InduminiDeAlwis)
- Repository: [GoMate](https://github.com/InduminiDeAlwis/GoMate)

---

## 🙏 Acknowledgments

- **Expo** for the amazing development platform
- **React Native** community for resources
- **TransportAPI** for data
- **Unsplash** for beautiful vehicle images
- **Feather Icons** for iconography

---

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Notification Guide](./NOTIFICATIONS_GUIDE.md) - Detailed push notification documentation

---

<div align="center">

**Made with ❤️ using React Native & Expo**

⭐ Star this repo if you find it helpful!

</div>

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
