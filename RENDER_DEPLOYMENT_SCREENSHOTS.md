# Visual Guide: Deploying to Render.com

This guide provides visual instructions for deploying the Solo Leveling Fitness RPG app to Render.com.

## Step 1: Sign Up for Render

Visit [render.com](https://render.com) and click "Sign Up" to create an account.

## Step 2: Connect GitHub Account

After signing in to Render, you'll need to connect your GitHub account.

1. From your dashboard, click on your profile icon in the top right
2. Select "Account Settings"
3. Navigate to "Git Providers"
4. Click "Connect" next to GitHub
5. Follow the authorization process

## Step 3: Create a New Web Service

1. From your dashboard, click the "New +" button
2. Select "Web Service"

![Create New Web Service](https://render.com/static/b34961f98f270ed66bb11faf1008e7d0/web-service-card.png)

## Step 4: Connect Your Repository

1. Select your GitHub account
2. Search for and select your repository (e.g., "solo-leveling-fitness")

![Connect Repository](https://render.com/static/f1750a91dfc86868b7ba8c24a0fb8b61/connect-repo.png)

## Step 5: Configure Your Web Service

Enter the following settings:

- **Name**: solo-leveling-fitness
- **Environment**: Node
- **Branch**: main
- **Region**: Choose the closest to your users
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free

![Configure Web Service](https://render.com/static/6aa5c5c3d9a83413d82f1d9d75ad0523/settings.png)

## Step 6: Add Environment Variables

1. Scroll down to the "Environment" section
2. Click "Add Environment Variable"
3. Add the following:
   - Key: `SESSION_SECRET`
   - Value: [Generate a random string](https://randomkeygen.com/)

![Environment Variables](https://render.com/static/4ee44f4e7c8e23d37f335b23afbaad2d/env-vars.png)

## Step 7: Create Web Service

1. Review all settings
2. Scroll to the bottom and click "Create Web Service"

## Step 8: Monitor Deployment

1. After creating the service, you'll be redirected to the service dashboard
2. You can view the build progress in the "Events" tab
3. The initial build may take 5-10 minutes

![Deployment Progress](https://render.com/static/e12f2f8a8e9b3c9eb82ea2c4bdb4b63a/events.png)

## Step 9: Access Your Deployed App

Once the deployment is complete:

1. You'll see a green "Live" status indicator
2. Click the URL provided at the top of the page (e.g., https://solo-leveling-fitness.onrender.com)

![Live Service](https://render.com/static/bfc5e16e9d9ca2e40b925d7ec7b54af0/live-service.png)

## Step 10: Log In to Your App

Use the provided test credentials to log in:
- Admin: username `admin`, password `sachin`
- Regular user: username `demo`, password `demo123`

## Troubleshooting

If you encounter issues:

1. Check the "Logs" tab in your service dashboard
2. Ensure all environment variables are correctly set
3. If needed, you can trigger a manual deploy from the "Manual Deploy" menu

![Logs and Manual Deploy](https://render.com/static/6a99b18c73ff54ddbab2b3ac64d56196/logs.png)

---

**Important Notes**:
- On the free tier, your service will "spin down" after 15 minutes of inactivity
- The first request after inactivity may take 30 seconds as the service spins up
- All data will be reset when the service restarts (in-memory storage)