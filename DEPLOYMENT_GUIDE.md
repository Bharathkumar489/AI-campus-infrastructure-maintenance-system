# Deployment & Public Access Guide

This guide explains how to access and share the **Campus Infrastructure Maintenance System** on the public internet.

---

## Option 1: Instant High-Speed Public Link (Cloudflare Tunnel - Active Now)

Your project is currently exposed via Cloudflare's global edge network:

- **Public Link:** [https://knowledge-owners-meetings-government.trycloudflare.com](https://knowledge-owners-meetings-government.trycloudflare.com)
- **Features:** 
  - Direct HTTPS connection
  - **No** passwords or IP prompts
  - **No** 408 timeout errors
  - Works on phones, laptops, and remote networks worldwide

### Re-launching Anytime:
Whenever you want to start the public link:
1. Double-click [share_public_link.bat](file:///c:/Users/bhara/OneDrive/Desktop/UM/share_public_link.bat).
2. It will automatically ensure your local server is running and give you a new public link.

---

## Option 2: Permanent 24/7 Cloud Hosting (Render.com)

If you want the website permanently online even when your PC is turned off:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Campus maintenance system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. **Deploy on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New + > Web Service**.
   - Connect your repo.
   - Settings:
     - **Runtime:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `node server/index.js`
     - **Instance Type:** `Free`
3. Click **Deploy Web Service** to get a permanent `.onrender.com` URL.
