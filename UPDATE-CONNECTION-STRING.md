# 🔧 Update MongoDB Atlas Connection String

## Your Connection String

You provided:
```
mongodb+srv://<db_username>:<db_password>@cluster01.cqqvxgw.mongodb.net/?appName=Cluster01
```

## ✅ Updated Format (with database name)

I've updated your `.env` file with this format:
```
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

**Changes made:**
- ✅ Added `/notez` (database name) before the `?`
- ✅ Changed `?appName=Cluster01` to `?retryWrites=true&w=majority` (standard format)

---

## 🔑 ACTION REQUIRED: Replace Placeholders

**Open:** `notez-backend/.env`

**Find this line:**
```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

**Replace with your actual credentials:**

### Example:
If your username is `notezadmin` and password is `MyPass123`, it should be:
```env
MONGODB_URI=mongodb+srv://notezadmin:MyPass123@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

---

## ⚠️ Important Notes

### If Your Password Has Special Characters:

If your password contains special characters like `@`, `#`, `%`, `&`, etc., you need to **URL encode** them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |

**Example:**
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`
- Connection string: `mongodb+srv://username:My%40Pass%23123@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority`

---

## ✅ Final Steps

1. **Update .env file** with your actual username and password
2. **Save the file**
3. **Restart backend server:**
   ```bash
   cd notez-backend
   npm start
   ```
4. **Check for success:**
   ```
   ✅ MongoDB connected: cluster01.cqqvxgw.mongodb.net
   ```

---

## 🧪 Test Connection

After restarting, test it:

1. **Health Check:** http://localhost:3001/health
   - Should show: `"database": { "connected": true }`

2. **Try Registration:** http://localhost:3000
   - Should work if connection is successful

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- ✅ Check username is correct
- ✅ Check password is correct
- ✅ URL encode special characters in password

### Error: "IP not whitelisted"
- ✅ Go to Atlas → Network Access
- ✅ Add your IP or "Allow Access from Anywhere"

### Error: "Connection timeout"
- ✅ Check cluster is not paused
- ✅ Resume cluster in Atlas dashboard if needed

---

## 📝 Quick Reference

**Your Cluster:** `cluster01.cqqvxgw.mongodb.net`

**Final Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

Replace `USERNAME` and `PASSWORD` with your actual credentials!

