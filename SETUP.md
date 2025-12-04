# Setup Guide for Shared Data

TripSplit uses **jsonbin.io** - a free JSON storage service for storing and sharing trip data. Multiple users can share and modify trip data in real-time.

## 🚀 Quick Start

1. **Get API Key**: Sign up at [jsonbin.io](https://jsonbin.io) and get your API key from [API Keys](https://jsonbin.io/api-keys)
2. **Create `.env` file** in project root:
   ```bash
   VITE_JSONBIN_MASTER_KEY=$2a$10$g7iT2hmHMBIoiIPfngh7bumI343YP0ZxWah62esACMww2j4/4l7.u
   ```
3. **Restart dev server**: `npm run dev`
4. **Done!** The app will now sync data to jsonbin.io

> ⚠️ **Without API keys**: The app will work with LocalStorage only (data won't sync across devices/browsers)

## ✅ Free Tier Available

- **Free tier** with generous limits
- **Public bins** can be accessed by anyone with the Bin ID
- **No credit card required** for free tier
- Upgrade available for higher limits

## How It Works

- All trip data is stored in a public JSON bin on jsonbin.io
- Multiple users can access the same Bin ID and see shared data
- Changes are synchronized automatically (polling every 1 second)
- Data is also backed up to LocalStorage as a fallback

## Setup

### 1. Get JSONBin.io API Keys

1. Go to [jsonbin.io](https://jsonbin.io) and create a free account
2. Navigate to [API Keys](https://jsonbin.io/api-keys) page
3. Copy your **Master Key** (or create an Access Key with read/write permissions)

### 2. Configure API Keys

Create a `.env` file in the project root directory:

```bash
# Create .env file
touch .env
```

Add your API key to the `.env` file:

```bash
# Option 1: Use Master Key (full access)
VITE_JSONBIN_MASTER_KEY=your_master_key_here

# Option 2: Use Access Key (limited permissions - recommended)
# VITE_JSONBIN_ACCESS_KEY=your_access_key_here
```

**Important**: 
- The `.env` file is gitignored and won't be committed to the repository
- For public bins, these keys can be exposed in client-side code
- For private bins, keep keys secure
- **Restart your dev server** after adding the keys: `npm run dev`

### 3. Set Bin ID

1. Create a bin on jsonbin.io (or use an existing bin ID)
2. Open Settings in the app
3. Enter your Bin ID
4. Share the same Bin ID with others to collaborate

## How It Works

- Uses **jsonbin.io** API for reliable JSON storage
- All data is stored in a shared JSON bin
- Changes sync automatically every 1 second
- Data is also backed up to each user's LocalStorage

## How Multiple Users Share Data

1. **One person** creates groups and adds bills
2. **All friends** open the same GitHub Pages URL
3. Everyone sees the same groups and expenses
4. Anyone can add/modify bills and members
5. Changes appear for everyone within 3 seconds

## Data Privacy

- Data is stored in a **public JSON endpoint** (anyone with the storage ID can access it)
- The storage ID is generated automatically and shared by all users of the same app
- All data is also saved to each user's LocalStorage as backup
- For completely private data, you would need to implement authentication (not included in this version)

## Troubleshooting

- **Data not syncing?** Check browser console for errors. Make sure you're not blocking the API requests and that your API keys are configured correctly.
- **Want different storage?** Use the Settings modal to change the Bin ID. Users with the same Bin ID will see the same data.
- **Rate limits?** jsonbin.io free tier has rate limits. If you hit limits, the app falls back to LocalStorage. Consider upgrading for higher limits.
- **Bin not found?** Make sure the Bin ID is correct and the bin exists. You can create a new bin on jsonbin.io and use its ID.

