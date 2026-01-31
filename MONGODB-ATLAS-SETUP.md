# 🗄️ MongoDB Atlas Setup Guide

Complete guide to connect MongoDB Atlas to your NoteZ backend.

---

## Step 1: Create MongoDB Atlas Account

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Click:** "Try Free" or "Sign Up"
3. **Sign up** with your email (or use Google/GitHub)
4. **Verify your email** if required

---

## Step 2: Create a Free Cluster

1. **After logging in**, you'll see "Deploy a cloud database"
2. **Choose:** "Build a Database"
3. **Select:** "FREE" tier (M0 Sandbox) - It's free forever!
4. **Choose Cloud Provider:**
   - AWS (recommended)
   - Google Cloud
   - Azure
5. **Select Region:**
   - Choose the region closest to you
   - Example: `N. Virginia (us-east-1)` for US
6. **Cluster Name:** Leave default or name it (e.g., "notez-cluster")
7. **Click:** "Create" (takes 1-3 minutes)

---

## Step 3: Create Database User

1. **After cluster is created**, you'll see a security prompt
2. **Click:** "Create Database User" or go to "Database Access" in left menu
3. **Authentication Method:** Choose "Password"
4. **Username:** Create a username (e.g., `notezadmin`)
5. **Password:** 
   - Click "Autogenerate Secure Password" (recommended)
   - **OR** create your own (save it securely!)
   - **IMPORTANT:** Copy and save the password - you won't see it again!
6. **Database User Privileges:** Leave as "Atlas admin" (or "Read and write to any database")
7. **Click:** "Add User"

---

## Step 4: Whitelist Your IP Address

1. **Go to:** "Network Access" in left menu
2. **Click:** "Add IP Address"
3. **For Development (Recommended):**
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (allows all IPs)
   - **Note:** Only use this for development!
4. **For Production:**
   - Click "Add Current IP Address" (adds your current IP)
   - Or manually add specific IPs
5. **Click:** "Confirm"

---

## Step 5: Get Connection String

1. **Go to:** "Database" in left menu
2. **Click:** "Connect" button on your cluster
3. **Choose:** "Connect your application"
4. **Driver:** Select "Node.js" and version "5.5 or later"
5. **Copy the connection string:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Step 6: Update Your .env File

1. **Open:** `notez-backend/.env` file
2. **Find the line:** `MONGODB_URI=...`
3. **Replace it with your Atlas connection string:**
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
   ```
   
   **Important:**
   - Replace `YOUR_USERNAME` with your database username
   - Replace `YOUR_PASSWORD` with your database password
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
   - Add `/notez` before `?` to specify database name
   - Keep `?retryWrites=true&w=majority` at the end

4. **Example:**
   ```
   MONGODB_URI=mongodb+srv://notezadmin:MySecurePass123@cluster0.abc123.mongodb.net/notez?retryWrites=true&w=majority
   ```

---

## Step 7: Restart Backend Server

1. **Stop backend** (Ctrl+C in backend terminal)
2. **Start it again:**
   ```bash
   cd notez-backend
   npm start
   ```
3. **Look for:**
   ```
   ✅ MongoDB connected: cluster0.xxxxx.mongodb.net
   🚀 NoteZ API server running on port 3001
   ```

---

## ✅ Verification

### Test Connection:

1. **Check backend terminal** - should show "MongoDB connected"
2. **Test health endpoint:**
   - Open: http://localhost:3001/health
   - Should show: `"database": { "connected": true }`
3. **Test registration:**
   - Go to: http://localhost:3000
   - Try registering a new account
   - Should work!

---

## 🔒 Security Best Practices

### For Development:
- ✅ Using "Allow Access from Anywhere" is OK
- ✅ Free tier is perfect for testing

### For Production:
- ❌ Don't use "Allow Access from Anywhere"
- ✅ Whitelist only your server's IP addresses
- ✅ Use strong database passwords
- ✅ Rotate passwords regularly
- ✅ Enable MongoDB Atlas monitoring/alerts

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- **Check:** Username and password are correct in connection string
- **Check:** Password doesn't have special characters that need URL encoding
- **Fix:** If password has `@`, `#`, `%`, etc., URL encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`

### Error: "IP not whitelisted"
- **Check:** Your IP is in Network Access whitelist
- **Fix:** Add your current IP or use "Allow Access from Anywhere" for development

### Error: "Connection timeout"
- **Check:** Cluster is not paused (free tier pauses after inactivity)
- **Fix:** Go to Atlas dashboard and resume cluster if paused

### Error: "Invalid connection string"
- **Check:** Connection string format is correct
- **Check:** Database name `/notez` is included
- **Check:** No extra spaces or quotes in .env file

---

## 📝 Quick Reference

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Your .env should have:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
```

---

## 💡 Pro Tips

1. **Save credentials securely** - Use a password manager
2. **Test connection** before deploying to production
3. **Monitor usage** - Free tier has limits (512MB storage)
4. **Backup data** - Set up automated backups in Atlas
5. **Use connection pooling** - Already configured in your app

---

## 🎉 You're Done!

Once connected, your backend will:
- ✅ Store user accounts
- ✅ Save notes and groups
- ✅ Handle authentication
- ✅ Work with all features

Happy coding! 🚀

