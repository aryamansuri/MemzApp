Memz
A modern, diary-inspired web app for logging, tagging, and visualizing your memories and events. Built with React, Firebase, and Recharts.

Features
📓 Create and manage multiple logs (like diaries or journals)
📝 Add events to each log with title, date, notes, and tags
🏷️ Tag events and search/filter by tag
📊 Visualize tag usage with interactive bar charts (Recharts)
🔎 View stats and co-tag patterns for each log
☁️ Real-time sync and persistence with Firebase Firestore
🗑️ Delete logs and events easily
✨ Beautiful, responsive UI with Tailwind CSS

Getting Started
1. Clone the repo
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2. Install dependencies
npm install

3. Set up Firebase
Create a Firebase project at firebase.google.com
Enable Firestore Database
Copy your Firebase config into firebase.js

4. Start the app
npm run dev

Open http://localhost:5173 in your browser.

Project Structure
src/
  App.jsx
  firebase.js
  ...
public/
  index.html
...


Tech Stack
React
Firebase Firestore
Recharts
Tailwind CSS
Vite
Customization
You can change the look and feel by editing Tailwind classes in App.jsx.
To use your own Firebase project, update firebase.js.
License
MIT