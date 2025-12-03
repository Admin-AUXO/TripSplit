# Deployment Guide for GitHub Pages

## Prerequisites
- GitHub account
- Repository named `TripSplit` (or update `base` in `vite.config.js`)

## Steps to Deploy

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository named `TripSplit`
   - Don't initialize with README (if you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/TripSplit.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages section
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to `main`

5. **Access Your App**:
   - Your app will be available at: `https://YOUR_USERNAME.github.io/TripSplit/`

## Important Notes

- The app uses LocalStorage, so data persists in the user's browser
- Each user's data is stored locally on their device
- The `base` path in `vite.config.js` must match your repository name
- If your repo has a different name, update the `base` field in `vite.config.js`

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see your app.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

