# GoMate – Travel & Transport Mobile App

**GoMate** is a cross-platform mobile application built using **React Native (Expo)** that allows users to view public transport schedules, explore destinations, and manage their favourite items.  

This project is developed as part of the **IN3210 Mobile Applications Development – Assignment 2**.

---

## **Table of Contents**

- [Features](#features)  
- [Screens](#screens)  
- [Installation](#installation)  
- [Running the App](#running-the-app)  
- [Navigation Structure](#navigation-structure)  
- [Tech Stack](#tech-stack)  
- [Folder Structure](#folder-structure)  
- [Demo Video & Screenshots](#demo-video--screenshots)  
- [Future Improvements / Bonus Features](#future-improvements--bonus-features)  

---

## **Features**

- User **Authentication**: Login & Registration (dummy API)  
- Dynamic **Home List** of transport/destination items  
- **Details Screen** with item information  
- **Favourites Management**: Mark/unmark items as favourite  
- **Profile Screen** showing logged-in user info  
- **State Management** using **Redux Toolkit**  
- Persistent data storage using **redux-persist + AsyncStorage**  
- Responsive UI with **Feather Icons**  
- Optional **Dark Mode Toggle** (bonus feature)  

---

## **Screens**

1. **LoginScreen** – Login with validation  
2. **RegisterScreen** – New user registration (optional)  
3. **HomeScreen** – Dynamic list of items (cards with image, title, status)  
4. **TransportDetailsScreen** – Detailed view with favourite toggle  
5. **FavouritesScreen** – Shows all favourited items  
6. **ProfileScreen** – User info and optional dark mode toggle  

---

## **Installation**

1. Clone the repository:

```bash
git clone https://github.com/InduminiDeAlwis/GoMate.git
cd GoMate