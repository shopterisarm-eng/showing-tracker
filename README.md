# Showing Tracker

Real estate showing tracker with AI-powered voice memos. Record showings on your phone, automatically transcribe and categorize home features, rate properties, and send summaries to clients.

## Features

- 📱 **Works on your phone** — Install as an app (PWA) on iOS or Android
- 🎙️ **Voice memos** — Record your thoughts about each home
- 🤖 **AI transcription** — Automatically transcribes and categorizes (Kitchen, Pool, Layout, Concerns, etc.)
- ⭐ **Ranking** — Rate each home and change rankings anytime
- 📧 **Client summaries** — Send formatted summaries to clients at end of day
- 📴 **Works offline** — Record and store locally, sync when you have internet

## Setup Instructions

### Step 1: Get Your Claude API Key

1. Go to https://console.anthropic.com/login
2. Sign up or log in
3. Click **API keys** in the sidebar
4. Click **Create Key**
5. Name it "Showing Tracker"
6. **Copy the key** and save it — you'll need it in a few minutes

### Step 2: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `showing-tracker`
3. Set it to **Public** (required for Vercel free tier)
4. Click **Create repository**

### Step 3: Upload the Code to GitHub

1. On your new GitHub repo page, click **uploading an existing file** (or the upload button)
2. Download all the files I created (you'll get a ZIP file)
3. Drag and drop all the files into GitHub's upload area
4. Make sure these files/folders are at the root:
   - `package.json`
   - `vercel.json`
   - `.gitignore`
   - `README.md`
   - `api/` folder (with `transcribe.js` and `send-summary.js`)
   - `public/` folder (with `index.html`, `app.js`, `manifest.json`, `service-worker.js`)
5. Click **Commit changes**

### Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/showing-tracker`
4. Click **Import**
5. On the configuration page:
   - **Project name**: `showing-tracker` (auto-filled)
   - **Root directory**: `.` (leave as is)
   - Click **Deploy**
6. Wait 1-2 minutes for deployment to complete
7. Once done, you'll see your live URL (like `https://showing-tracker-abc123.vercel.app`)

### Step 5: Add Your Claude API Key to Vercel

1. After deployment, go back to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Click **Add New** and enter:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Paste your Claude API key from Step 1
   - Click **Add**
4. Click **Deployments** and redeploy by clicking the latest deployment and selecting **Redeploy**

### Step 6: Install on Your Phone

#### iPhone (Safari):
1. Open your Vercel URL in Safari (e.g., https://showing-tracker-abc123.vercel.app)
2. Tap the **Share** icon (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Name it "Showing Tracker"
5. Tap **Add**

#### Android (Chrome):
1. Open your Vercel URL in Chrome
2. Tap the **⋮** menu (three dots)
3. Tap **Install app** or **Add to Home screen**
4. Confirm

## How to Use

### Adding a Showing

1. **Property address** — Required (e.g., "123 Main St, Glendale AZ")
2. **Client name** — Optional but helpful
3. **Quick notes** — Pre-fill with features you notice (optional)
4. Click **Add showing**

### Recording Memos

1. Under any showing, tap **Record memo**
2. Allow microphone access when prompted
3. Talk naturally for up to 60 seconds (e.g., "The kitchen is spacious with granite counters. There's a large pool in the back. The bathroom needs work though.")
4. When done, release the button
5. The app automatically:
   - **Transcribes** your voice to text
   - **Categorizes** features (Positive, Concerns, Size, Condition, Client Reaction)
   - Shows color-coded tags

### Rating Homes

1. Click the **stars** under any showing to rate it 1-5
2. Change it anytime
3. When you generate a summary, homes sort by rating automatically

### Sending Client Summaries

1. Click the **Summary** tab
2. Enter client **email** and **name** (optional)
3. Click **Generate summary**
4. Review the preview
5. Click **Download summary** to save as HTML file
6. Copy/paste the content into an email, or attach the file

## Troubleshooting

### "Microphone access denied"
- Go to your phone's settings
- Find the browser (Safari/Chrome) → Permissions → Microphone
- Enable microphone access
- Try again

### "API error" when transcribing
- Check that your Claude API key is set in Vercel (Settings → Environment Variables)
- Make sure you have credit on your Anthropic account (free $5 to start)
- Try refreshing the app

### App not installing on phone
- Make sure you're using the correct browser (Safari for iPhone, Chrome for Android)
- Clear your browser cache and try again

### Data disappeared
- Data is stored locally on your device
- If you clear browser cache/data, it's lost
- For backup, regularly download summaries

## API Costs

- Each voice memo transcription costs ~$0.001-0.002 USD (Claude Opus pricing)
- 100 memos per day = ~$0.15/day
- You get $5 free credit from Anthropic to start

## Privacy

- All your recording data stays on your phone until you generate a summary
- Summary generation sends the transcript to Claude's API (via Vercel)
- Never stored on servers — only processed and deleted

## Support

If you have issues:
1. Check browser console (F12) for error messages
2. Try incognito/private mode
3. Make sure JavaScript is enabled
4. Vercel deployment should be live within 2 minutes

## Advanced: Email Integration (Optional)

To automatically email summaries instead of downloading:

1. Sign up for SendGrid (free tier available)
2. Get your SendGrid API key
3. In Vercel Settings → Environment Variables, add:
   - `SENDGRID_API_KEY`: your key
   - `SENDER_EMAIL`: your email address
4. Uncomment the SendGrid code in `api/send-summary.js`
5. Redeploy

---

Made with Claude for real estate professionals.
