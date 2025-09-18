# NoteZ Deployment Guide

This guide covers deployment of the NoteZ application to various cloud platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#ssl-https-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Node.js 16.x or higher
- MongoDB Atlas account (or self-hosted MongoDB)
- Git repository
- Domain name (optional but recommended)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `notez-backend` directory:

```env
# Application
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notez?retryWrites=true&w=majority

# JWT Configuration (Required)
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS (Update with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@notez.com
```

### Frontend Environment Variables

In your Vercel dashboard or `.env.local`:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up.

2. **Deploy from GitHub**:
   ```bash
   # Connect your repository to Railway
   # Set the root directory to: notez-backend
   # Railway will auto-detect the Node.js app
   ```

3. **Configure Environment Variables** in Railway dashboard:
   - Add all variables from the backend `.env` example above
   - Set `CORS_ORIGIN` to your Vercel frontend URL

4. **Configure Build Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `notez-backend`

### Option 2: Render

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up.

2. **Create Web Service**:
   - Connect your repository
   - Set root directory to `notez-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables** in Render dashboard.

### Option 3: Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   cd notez-backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set CORS_ORIGIN="https://your-frontend-domain.vercel.app"
   # Add other variables...
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## Frontend Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Root Directory: `./` (project root)

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

4. **Domain Configuration**:
   - Add custom domain in Vercel dashboard
   - Configure DNS settings

### Netlify (Alternative)

1. **Connect Repository** to Netlify
2. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `build`
3. **Environment Variables**: Add `REACT_APP_API_URL`

## Database Setup

### MongoDB Atlas

1. **Create Cluster**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster
   - Choose your preferred region

2. **Configure Network Access**:
   - Add `0.0.0.0/0` for allow all IPs (for cloud deployments)
   - Or add specific IPs for your deployment platforms

3. **Create Database User**:
   - Create a user with read/write permissions
   - Note the username and password

4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)

Both Vercel and Railway provide automatic SSL certificates:
- **Vercel**: Automatic Let's Encrypt certificates
- **Railway**: Automatic SSL for custom domains

### Custom SSL

If using custom domains:
1. Configure DNS to point to your deployment platform
2. Add domain in platform dashboard
3. SSL certificates will be automatically provisioned

## Monitoring and Maintenance

### Health Checks

The backend includes a health check endpoint:
```
GET /health
```

Monitor this endpoint for uptime checking.

### Logging

Configure logging in production:
```env
LOG_LEVEL=warn
LOG_FORMAT=combined
```

### Database Monitoring

- Monitor MongoDB Atlas metrics
- Set up alerts for connection issues
- Regular backup verification

### Security Updates

1. **Regular Updates**:
   ```bash
   npm audit
   npm update
   ```

2. **Security Headers**: Already configured in the application

3. **Environment Variables**: Never commit secrets to version control

## Deployment Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] CORS origins updated
- [ ] SSL certificates configured
- [ ] Domain DNS configured

### Backend Checklist

- [ ] MongoDB URI configured
- [ ] JWT secret set (minimum 32 characters)
- [ ] CORS origin updated to frontend domain
- [ ] File upload directory configured
- [ ] Rate limiting configured
- [ ] Error handling tested

### Frontend Checklist

- [ ] API URL environment variable set
- [ ] Build process tested locally
- [ ] Authentication flow tested
- [ ] Socket.io connection tested
- [ ] Responsive design verified

### Post-Deployment

- [ ] Health check endpoint responding
- [ ] Authentication working
- [ ] Real-time features (chat, notifications) working
- [ ] File uploads working
- [ ] AI features working (if enabled)
- [ ] Database operations working
- [ ] SSL certificate active
- [ ] Performance monitoring setup

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `CORS_ORIGIN` environment variable
   - Ensure frontend domain matches exactly

2. **Database Connection Failures**:
   - Verify MongoDB URI
   - Check network access whitelist
   - Verify database user credentials

3. **Authentication Issues**:
   - Check JWT secret configuration
   - Verify token expiration settings
   - Check middleware order

4. **Socket.io Connection Issues**:
   - Verify WebSocket support on deployment platform
   - Check CORS configuration for Socket.io

### Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally with production environment variables
4. Contact platform support if needed

## Performance Optimization

### Backend Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Consider Redis for session storage
3. **Load Balancing**: Use platform load balancing features
4. **Monitoring**: Set up application performance monitoring

### Frontend Optimization

1. **Code Splitting**: Already implemented with React
2. **Asset Optimization**: Vercel handles this automatically
3. **CDN**: Vercel provides global CDN
4. **Caching**: Configure appropriate cache headers

This guide should help you deploy NoteZ successfully to production. Always test thoroughly in a staging environment before deploying to production.
