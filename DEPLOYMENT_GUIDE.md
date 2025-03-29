# Deployment Guide for Solo Leveling Fitness RPG

This guide provides detailed instructions for deploying the Solo Leveling Fitness RPG application to Render.com, which offers a free tier suitable for hosting this application.

## Option 1: Deploying to Render.com (Recommended)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "solo-leveling-fitness")
4. Make the repository public
5. Click "Create repository"

### Step 2: Push Your Code to GitHub

From your local development environment, run:

```bash
# Initialize Git repository if needed
git init

# Add all files to staging
git add .

# Commit the changes
git commit -m "Initial commit"

# Add the GitHub repository as the remote origin
git remote add origin https://github.com/yourusername/solo-leveling-fitness.git

# Push the code to GitHub
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

### Step 3: Set Up Render.com Account

1. Go to [Render.com](https://render.com/) and sign up for a free account
2. Verify your email address
3. Complete the account setup process

### Step 4: Create a New Web Service on Render

1. From the Render dashboard, click the "New +" button
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Select the repository you created in Step 1
5. Render will automatically detect the `render.yaml` file and pre-configure settings

### Step 5: Configure the Web Service

Make sure the following settings are correct:

- **Name**: solo-leveling-fitness (or your preferred name)
- **Environment**: Node
- **Region**: Choose the one closest to your users
- **Branch**: main (or the branch you want to deploy)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free

### Step 6: Set Up Environment Variables

1. Click the "Environment" tab
2. Add the following environment variable:
   - Key: `SESSION_SECRET`
   - Value: [Generate a random string](https://randomkeygen.com/)
3. Save the changes

### Step 7: Deploy Your Application

1. Click "Create Web Service"
2. Render will start the deployment process, which can take 5-10 minutes for the initial build
3. You can monitor the build process in real-time from the logs

### Step 8: Access Your Deployed Application

Once deployment is complete:

1. Render will provide a unique URL for your application (e.g., `https://solo-leveling-fitness.onrender.com`)
2. Click the URL to open your application in a browser
3. Verify that the application is working correctly

### Important Notes About Render Deployment

- **Free Tier Limitations**: On the free tier, your service will "spin down" after 15 minutes of inactivity
- **Spin-up Time**: The first request after inactivity may take up to 30 seconds as the service spins back up
- **Data Persistence**: Since the app uses in-memory storage, data will be reset whenever the service restarts

## Option 2: Using GitHub Pages (Static Frontend Only)

GitHub Pages can host the frontend portion of your application, but it cannot host the Node.js backend. If you choose this option, you would need to:

1. Modify the application to use a separate API service or serverless functions
2. Or use the frontend as a demo/preview with mock data

Since this application requires a backend for full functionality, Render.com is the recommended deployment option.

## Troubleshooting Common Deployment Issues

### Application Crashes on Startup

1. Check the build logs for specific error messages
2. Ensure all environment variables are correctly set
3. Verify the Node.js version compatibility

### Cannot Connect to GitHub Repository

1. Make sure your GitHub repository is public
2. Ensure you've granted Render permission to access your repositories
3. Try disconnecting and reconnecting your GitHub account

### Build Process Fails

1. Check for any syntax errors in your code
2. Ensure all dependencies are correctly listed in `package.json`
3. Verify that the build command is correct

### Application Runs but Features Don't Work

1. Check the browser console for JavaScript errors
2. Verify that API endpoints are being called correctly
3. Ensure environment variables are correctly set
4. Check that the database connection (if using) is working

## Testing Your Deployment

After deployment, test the following features to ensure everything is working:

1. **Authentication**: Test logging in with provided test accounts
2. **User Features**: Create a quest, complete a workout, view the leaderboard
3. **Admin Features**: Log in as admin and verify Architect Panel functionality

## Getting Help

If you encounter issues with Render.com deployment:

1. Check the [Render Documentation](https://render.com/docs)
2. Visit the [Render Community Forum](https://community.render.com/)
3. Contact Render support through your account dashboard