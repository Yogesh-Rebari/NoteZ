# Quick: Update .env with MongoDB Atlas

## Step 1: Get Your Connection String from Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## Step 2: Update .env File

**File location:** `notez-backend/.env`

**Find this line:**
```env
MONGODB_URI=mongodb://localhost:27017/notez
```

**Replace with your Atlas connection string:**
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_USERNAME` with your Atlas database username
- Replace `YOUR_PASSWORD` with your Atlas database password  
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
- Make sure `/notez` is included (database name)
- Keep `?retryWrites=true&w=majority` at the end

## Step 3: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Then:
cd notez-backend
npm start
```

## Step 4: Verify

Check backend terminal for:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

Test: http://localhost:3001/health

---

**Need help?** See `MONGODB-ATLAS-SETUP.md` for detailed guide.

