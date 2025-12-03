# Setup Guide for Shared Data

TripSplit uses **jsonstorage.net** - a completely free JSON storage service that requires no API keys or registration. Multiple users can share and modify trip data in real-time.

## ✅ 100% Free - No Payment Required

- **No credit card required**
- **No subscriptions**
- **No premium features**
- **No payment processing**
- All features are completely free to use

## How It Works

- All trip data is stored in a public JSON bin on JSONBin.io
- Multiple users can access the same GitHub Pages URL and see shared data
- Changes are synchronized automatically (polling every 3 seconds)
- Data is also backed up to LocalStorage as a fallback

## Setup (No Setup Required!)

The app works immediately without any setup, API keys, or registration! All users accessing your GitHub Pages link will automatically share the same data.

## How It Works

- Uses **jsonstorage.net** - completely free, no registration needed
- All data is stored in a shared JSON endpoint
- Changes sync automatically every 2 seconds
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

- **Data not syncing?** Check browser console for errors. Make sure you're not blocking the API requests.
- **Want different storage?** You can modify `getStorageId()` in `src/utils/simpleStorage.js` to use a different storage ID per group.
- **Rate limits?** jsonstorage.net is free but may have rate limits. If you hit limits, the app falls back to LocalStorage.

