# Solo Leveling Fitness RPG App

A fitness RPG application inspired by Solo Leveling that transforms workout tracking into an engaging, gamified experience.

## Features

- **RPG-Style Progression**: Level up your character as you complete workouts
- **Rank System**: Progress through hunter ranks from E to SS
- **Job Class System**: Choose different job classes with unique perks
- **Quest System**: Complete fitness quests to earn rewards
- **In-app Shop**: Purchase items to boost your character
- **Leaderboard**: Compete with other users

## Tech Stack

- React with TypeScript frontend
- Express.js backend
- Memory-based storage
- Tailwind CSS for responsive UI

## Deployment to Render.com

### Prerequisites

- A GitHub account
- A Render.com account (free tier is sufficient)

### Step 1: Push the Code to GitHub

1. Create a new GitHub repository
2. Push this code to the repository

### Step 2: Connect to Render.com

1. Sign up for a Render.com account at [render.com](https://render.com/)
2. From the dashboard, click "New" and select "Web Service"
3. Connect your GitHub account and select the repository

### Step 3: Configure the Web Service

- **Name**: Choose a name for your service (e.g., "fitness-rpg-app")
- **Environment**: Node
- **Branch**: main (or your preferred branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free

### Step 4: Add Environment Variables

Under the "Environment" tab, add the following environment variable:
- `SESSION_SECRET`: Generate a random string for session security

### Step 5: Deploy

Click "Create Web Service" and Render will begin deploying your application.

## User Credentials

For testing purposes, the app is seeded with the following users:
- Admin: username: `admin`, password: `sachin`
- Regular user: username: `demo`, password: `demo123`

## Local Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. Access the application at http://localhost:5000