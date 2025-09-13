# Memz

A **modern, diary-inspired web app** for logging, tagging, and visualizing your memories and events.
Built with **React**, **Firebase**, and **Recharts**.

---

## ✨ Features

* 📓 **Multiple Logs** – Create and manage multiple diaries or journals
* 📝 **Events** – Add events with title, date, notes, and tags
* 🏷️ **Tagging & Search** – Tag events and filter/search by tag
* 📊 **Visualization** – View tag usage with interactive bar charts (powered by Recharts)
* 🔎 **Stats & Insights** – Explore co-tag patterns and usage trends
* ☁️ **Cloud Sync** – Real-time data persistence with Firebase Firestore
* 🗑️ **Easy Management** – Delete logs and events effortlessly
* 🎨 **Responsive UI** – Clean, modern design styled with Tailwind CSS

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
https://github.com/aryamansuri/MemzApp.git
cd MemzApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Firestore Database**
3. Copy your Firebase config into `src/firebase.js`

### 4. Start the Development Server

```bash
npm run dev
```

Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## 📂 Project Structure

```
src/
  App.jsx
  firebase.js
  components/
  pages/
  ...
public/
  index.html
  ...
```

---

## 🛠 Tech Stack

* **React** – UI framework
* **Firebase Firestore** – Real-time database
* **Recharts** – Interactive data visualizations
* **Tailwind CSS** – Styling
* **Vite** – Fast development build tool

---

## 🎨 Customization

* Modify **Tailwind classes** in `App.jsx` (or components) to customize styles
* Update `firebase.js` with your own Firebase project configuration

---

## 📄 License

This project is licensed under the **MIT License**.

