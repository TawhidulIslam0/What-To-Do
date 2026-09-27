# What To Do 

A full-stack travel planning application that helps users discover places in NYC and build personalized itineraries.

## Features
- User registration and login
- Google OAuth
- Create and edit itineraries
- Save itineraries
- Complete itineraries
- Google Maps integration
- Location-based itinerary planning
- User profiles
- Secure JWT authentication

## Tech Stack

### Frontend
- React
- JavaScript
- Google Maps JavaScript API
- Create React App

### Backend
- Node.js
- Express
- SQLite
- better-sqlite3
- JWT
- bcrypt

## Project Structure

What-To-Do-main/
├── backend/
├── frontend/
├── .env.example
├── .gitignore
└── README.md

## Getting Started

### 1. Clone the repository

git clone <your-repository-url>

### 2. Backend

cd backend
npm install
npm start

### 3. Frontend

cd frontend
npm install
npm start

## Environment Variables

Create your local `.env` files using `.env.example`.

Never commit API keys, OAuth credentials, JWT secrets,
or local database files.

## Google Maps

The application uses Google Maps to display and organize
destinations within New York City.

