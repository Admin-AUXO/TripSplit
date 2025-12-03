# TripSplit 💰

A simple and intuitive bill splitting web app for friends, similar to Splitwise.

## Features

- ✨ Create and manage trip groups
- 👥 Add/remove members from groups
- 💳 Add bills with categories, descriptions, and custom split ratios
- 📊 Automatic expense tallying to see who owes whom
- 💾 Data persistence using LocalStorage
- 🎨 Clean and modern UI/UX

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

## Deployment

The app is configured to deploy to GitHub Pages automatically via GitHub Actions. Just push to the `main` branch and it will deploy to `https://[username].github.io/TripSplit/`

## Shared Data

The app uses **jsonstorage.net** (completely free, no registration, no credit card required) to store shared data. Multiple friends can open the same GitHub Pages link and see/modify the same trip expenses in real-time. No setup required - it works out of the box!

**100% Free Forever** - All features are free. No subscriptions, no premium tiers, no payment processing. Everything works with free services.

See [SETUP.md](./SETUP.md) for more details.

## How to Use

1. **Create a Group**: Click "New Group" to create a trip group
2. **Add Members**: Add friends to your group
3. **Add Bills**: Record expenses with categories and split them among members
4. **View Tally**: See who owes whom and settle up!

