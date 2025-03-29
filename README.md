# ⚔️ Solo Leveling Fitness RPG App 🏋️‍♂️

A fitness RPG application inspired by the popular manhwa "Solo Leveling" that transforms workout tracking into an engaging, gamified experience. This app functions like "The System" from Solo Leveling but is designed for fitness training & tracking.

![Solo Leveling Fitness RPG](https://raw.githubusercontent.com/sachindkd/solo-leveling-fitness/main/generated-icon.png)

## 🎮 Core Features

### 🔹 Hunter Progression System
- **XP & Leveling**: Gain XP by completing workouts and quests
- **Hunter Ranks**: Progress through hunter ranks from E to SS
- **Stats System**: Develop your Strength, Stamina, Speed, and Endurance

### 🔹 Job Awakening System
- **Special Classes**: Unlock different job classes based on your rank:
  - **E-Rank**: Novice Hunter (Basic Training)
  - **D-Rank**: Assassin (+Speed, +Critical Hits)
  - **C-Rank**: Berserker (+Strength, +Attack Power)
  - **B-Rank**: Mage (+Stamina, +Energy Control)
  - **A-Rank**: Tank (+Defense, +Endurance)
  - **S-Rank**: Warlock (+Mana Control, +Magic Boost)
  - **SS-Rank**: Shadow Monarch (Ultimate Buffs - All Stats Increase!)

### 🔹 Quest System
- **Daily & Weekly Quests**: Complete fitness challenges for rewards
- **Personalized Workouts**: Get workout suggestions based on your stats and job class
- **Quest Rewards**: Earn XP, coins, and stat boosts

### 🔹 Additional Features
- **In-app Shop**: Purchase items to boost your character
- **Leaderboard**: Compete with other hunters for top rankings
- **Architect Panel**: Admin interface to manage the system (for admins only)

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

1. Create a new GitHub repository at [github.com/new](https://github.com/new)
2. Name your repository (e.g., "solo-leveling-fitness")
3. Push this code to the repository using the following commands:

```bash
# If you haven't already initialized the repository
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository as the remote origin
git remote add origin https://github.com/yourusername/solo-leveling-fitness.git

# Push the code to GitHub
git push -u origin main
```

**Note**: Replace "yourusername" with your actual GitHub username, and "main" with your branch name if different.

### Step 2: Connect to Render.com

1. Sign up for a Render.com account at [render.com](https://render.com/)
2. From the dashboard, click "New" and select "Web Service"
3. Connect your GitHub account when prompted
4. Search for and select the repository you just created

### Step 3: Configure the Web Service

Render will detect the `render.yaml` file in your repository and pre-fill most fields, but you should verify these settings:

- **Name**: Choose a name for your service (e.g., "fitness-rpg-app")
- **Environment**: Node
- **Branch**: main (or your preferred branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free

Make sure the "Auto-Deploy" option is enabled to automatically deploy new changes when you push to GitHub.

### Step 4: Add Environment Variables

Under the "Environment" tab, add the following environment variable:
- **Key**: `SESSION_SECRET`
- **Value**: Generate a random string (you can use [randomkeygen.com](https://randomkeygen.com/) for this)

This secret is required for secure session management.

### Step 5: Deploy

Click "Create Web Service" and Render will begin deploying your application. The deployment process typically takes 5-10 minutes for the initial build.

### Step 6: Monitor Deployment and Access Your App

1. Monitor the build logs to ensure everything deploys successfully
2. Once deployment is complete, Render will provide a URL (e.g., https://fitness-rpg-app.onrender.com)
3. Click the URL to access your deployed application

**Note**: On the free tier of Render.com, your app may "spin down" after 15 minutes of inactivity. The first request after inactivity may take up to 30 seconds to respond as the service spins back up.

## Important Notes About Deployment

- **Data Persistence**: This application uses in-memory storage, which means all data will be reset whenever the application restarts on Render.com. This is expected behavior with the free tier.
- **Health Check**: The app includes a `/health` endpoint that Render uses to verify your application is running correctly.
- **Security**: As this is a demo application, it uses plaintext passwords. In a production environment, you would want to implement proper password hashing.

## User Credentials

For testing purposes, the app is seeded with the following users:
- **Admin**: username: `admin`, password: `sachin`
- **Regular user**: username: `demo`, password: `demo123`

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/solo-leveling-fitness.git
cd solo-leveling-fitness
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on the example
```bash
cp .env.example .env
# Edit the .env file to add your SESSION_SECRET
```

4. Start the development server
```bash
npm run dev
```

5. Access the application at http://localhost:5000

## Troubleshooting Deployment

If you encounter issues during deployment:

1. Check the build logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure the GitHub repository is public or that Render has access to it
4. Check that the Node.js version is compatible (Render uses Node.js 18.x by default)
5. Try redeploying manually from the Render dashboard