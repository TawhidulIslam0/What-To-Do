# What To Do

A full-stack travel planning application designed to help users discover top destinations across New York City and curate personalized itineraries.

---

## 🌟 Key Features

* **User Authentication:** Secure signup/login with JWT and support for Google OAuth 2.0.
* **Interactive Map Integration:** Real-time location-based travel planning using the Google Maps JavaScript API.
* **Itinerary Management:** Create, edit, complete, and save custom itineraries.
* **Personalized Profiles:** Track upcoming and completed trips directly from user profiles.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React.js, JavaScript (ES6+)
* **Tooling:** Create React App
* **APIs:** Google Maps JavaScript API

### Backend
* **Runtime & Framework:** Node.js, Express.js
* **Database:** SQLite (via `better-sqlite3`)
* **Security & Auth:** JSON Web Tokens (JWT), bcrypt

---

## 📁 Project Structure

```text
What-To-Do-main/
├── backend/          # Express API server & SQLite database
├── frontend/         # React client application
├── .env.example      # Sample environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
