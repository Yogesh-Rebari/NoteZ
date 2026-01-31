# 🔑 How to Get MongoDB Atlas Username and Password

## Where to Find/Create Your Credentials

The username and password are **NOT automatically generated** - you need to **create them** in MongoDB Atlas.

---

## Step-by-Step Guide

### Step 1: Log into MongoDB Atlas

1. Go to: https://cloud.mongodb.com
2. **Sign in** to your account

---

### Step 2: Go to Database Access

1. In the left sidebar, click **"Database Access"**
   - (It's under "Security" section)
2. You'll see a list of database users (if any exist)

---

### Step 3: Create a New Database User

**If you don't have a user yet:**

1. Click **"Add New Database User"** button (green button)
2. **Authentication Method:** Choose **"Password"**
3. **Username:** 
   - Enter a username (e.g., `notezadmin`, `notezuser`, `admin`)
   - This is what you'll use for `<db_username>`
4. **Password:**
   - **Option A (Recommended):** Click **"Autogenerate Secure Password"**
     - A secure password will be generated
     - **⚠️ IMPORTANT:** Copy this password immediately - you won't see it again!
     - Save it somewhere safe (password manager, text file, etc.)
   - **Option B:** Create your own password
     - Make it strong (at least 12 characters, mix of letters, numbers, symbols)
     - **⚠️ Save it** - you'll need it for the connection string
5. **Database User Privileges:**
   - For development: Choose **"Atlas admin"** (full access)
   - OR choose **"Read and write to any database"**
6. Click **"Add User"**

**If you already have a user:**

- You'll see the username in the list
- **Password:** You cannot see the password (it's encrypted)
- **If you forgot the password:**
  - Click the **"Edit"** button (pencil icon) next to the user
  - Click **"Edit Password"**
  - Enter a new password
  - **Save it!**

---

## Step 4: Copy Your Credentials

After creating the user, you'll have:

- **Username:** The username you created (e.g., `notezadmin`)
- **Password:** The password you generated/created

**Example:**
- Username: `notezadmin`
- Password: `MySecurePass123!`

---

## Step 5: Update Your .env File

Open `notez-backend/.env` and update:

**Find:**
```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

**Replace with your actual credentials:**
```env
MONGODB_URI=mongodb+srv://notezadmin:MySecurePass123!@cluster01.cqqvxgw.mongodb.net/notez?retryWrites=true&w=majority
```

---

## 📍 Quick Navigation in Atlas

**Path to Database Access:**
```
MongoDB Atlas Dashboard
  → Left Sidebar
    → Security (section)
      → Database Access
```

**Visual Guide:**
```
┌─────────────────────────┐
│  MongoDB Atlas          │
├─────────────────────────┤
│  ☰ Menu                 │
│                         │
│  📊 Database            │
│  🔒 Security            │
│    ├─ Database Access   │ ← Click here!
│    ├─ Network Access   │
│    └─ Encryption        │
│  📈 Monitoring          │
│  ⚙️  Settings           │
└─────────────────────────┘
```

---

## ⚠️ Important Notes

### Password Security

1. **Save your password immediately** - you can't see it again after creation
2. **Use a password manager** to store it securely
3. **Don't share it** publicly or commit it to Git

### If You Forgot Your Password

1. Go to **Database Access**
2. Find your user
3. Click **"Edit"** (pencil icon)
4. Click **"Edit Password"**
5. Enter new password
6. **Save it!**

### Special Characters in Password

If your password has special characters, you may need to URL encode them in the connection string:

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
| `!` | `%21` |

**Example:**
- Password: `My@Pass#123!`
- In connection string: `My%40Pass%23123%21`

---

## ✅ Verification

After updating `.env` with your credentials:

1. **Restart backend:**
   ```bash
   cd notez-backend
   npm start
   ```

2. **Check for success:**
   ```
   ✅ MongoDB connected: cluster01.cqqvxgw.mongodb.net
   ```

3. **If you see "Authentication failed":**
   - Double-check username and password
   - Make sure no extra spaces
   - URL encode special characters if needed

---

## 🆘 Troubleshooting

### "Authentication failed" Error

**Possible causes:**
- ❌ Username is incorrect
- ❌ Password is incorrect
- ❌ Special characters not URL encoded
- ❌ Extra spaces in connection string

**Solution:**
1. Verify username in Atlas → Database Access
2. Reset password if needed (Edit → Edit Password)
3. URL encode special characters
4. Check `.env` file for typos

### Can't See Password

**This is normal!** Passwords are encrypted and never shown.

**If you forgot it:**
- Reset it: Database Access → Edit → Edit Password

---

## 📝 Summary

1. **Go to:** MongoDB Atlas → Security → Database Access
2. **Create user:** Add New Database User
3. **Save credentials:** Username and Password
4. **Update .env:** Replace `<db_username>` and `<db_password>`
5. **Restart backend:** Test connection

That's it! 🎉

