# 🚀 Free Deployment Guide

This guide will help you deploy your CRM application completely free using services with generous free plans.

## 📁 Included Configuration Files

This project includes configuration files to facilitate deployment:

- **`render.yaml`**: Configuration for Render.com (backend)
- **`railway.json`**: Configuration for Railway.app (backend)
- **`vercel.json`**: Configuration for Vercel (frontend)

These files simplify the deployment process. You just need to connect them to your repository and configure environment variables.

## 📋 Recommended Deployment Architecture

### Option 1: Recommended (Easiest)

- **Frontend (Next.js)**: Vercel (free, perfect for Next.js)
- **Backend (NestJS)**: Render (free plan with 750 hours/month)
- **PostgreSQL Database**: Neon (free plan with 0.5 GB)

### Option 2: Alternative

- **Frontend (Next.js)**: Vercel
- **Backend (NestJS)**: Railway (free plan with $5 credit/month)
- **PostgreSQL Database**: Supabase (free plan with 500 MB)

---

## 🎯 Option 1: Vercel + Render + Neon

### Step 1: Deploy Database on Neon

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **Connection String** (DATABASE_URL)
   - Format: `postgresql://user:password@host/database?sslmode=require`

### Step 2: Configure Backend Environment Variables

You'll need these variables in Render:

```env
DATABASE_URL=postgresql://... (from Neon)
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_... (if using Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (if using webhooks)
```

### Step 3: Deploy Backend on Render

**Option A: Using render.yaml (Recommended)**

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. You only need to configure environment variables marked as `sync: false`:
   - `DATABASE_URL` (from Neon)
   - `CORS_ORIGIN` (your frontend URL on Vercel)
6. Render will automatically generate `JWT_SECRET` and `JWT_REFRESH_SECRET`
7. Click "Apply"
8. Copy the backend URL (e.g., `https://crm-backend.onrender.com`)

**Option B: Manual Configuration**

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configuration:
   - **Name**: `crm-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Root Directory**: `backend`
5. Add the environment variables from Step 2
6. Click "Create Web Service"
7. Copy the backend URL (e.g., `https://crm-backend.onrender.com`)

⚠️ **Note**: Render's free plan "sleeps" after 15 minutes of inactivity. The first request may take ~30 seconds.

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and create an account with GitHub
2. Click "Add New Project"
3. Import your repository
4. Configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api
   ```
6. Click "Deploy"
7. Vercel will give you a URL like `https://your-app.vercel.app`

### Step 5: Update CORS in Backend

1. In Render, edit the environment variables
2. Update `CORS_ORIGIN` with the Vercel URL:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
3. Restart the service

### Step 6: Run Prisma Migrations

You need to run Prisma migrations on the Neon database:

**Option A: From your local machine**

```bash
cd backend
# Temporarily set DATABASE_URL with Neon's
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

**Option B: From Render (using a script)**

1. Add a script in `backend/package.json`:
   ```json
   "postinstall": "prisma generate && prisma migrate deploy"
   ```
2. This will run migrations automatically on each deploy

---

## 🎯 Option 2: Vercel + Railway + Supabase

### Step 1: Database on Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the URI (use "URI" format, not "Connection Pooling")

### Step 2: Backend on Railway

1. Go to [railway.app](https://railway.app) and create an account with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect the `railway.json` file and configure everything
5. You only need to:
   - Set **Root Directory** as `backend` (if not automatically detected)
   - Add environment variables in Settings → Variables
6. Railway will automatically give you a URL

💡 **Tip**: Railway uses the `railway.json` file to automatically configure build and deploy.

### Step 3: Frontend on Vercel

Same as Option 1, but use Railway's URL for `NEXT_PUBLIC_API_URL`

---

## 🔧 Additional Configuration

### To Prevent Render from Sleeping (Optional)

You can use a service like [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 5 minutes and keep it awake.

### Required Environment Variables

**Backend (.env in Render/Railway):**

```env
DATABASE_URL=postgresql://...
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app
JWT_SECRET=generate-a-secure-random-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-different-secure-key
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_... (optional)
STRIPE_WEBHOOK_SECRET=whsec_... (optional)
```

**Frontend (in Vercel):**

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Generate Secure JWT Secrets

You can generate secure secrets with:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📊 Free Plans Comparison

| Service      | Free Limit                         | Advantages                                       |
| ------------ | ---------------------------------- | ------------------------------------------------ |
| **Vercel**   | Unlimited (with reasonable limits) | Perfect for Next.js, global CDN, instant deploys |
| **Render**   | 750 hours/month                    | Easy to use, sleeps after 15 min                 |
| **Railway**  | $5 credit/month                    | Doesn't sleep, faster than Render                |
| **Neon**     | 0.5 GB storage                     | Serverless PostgreSQL, very fast                 |
| **Supabase** | 500 MB storage                     | Includes auth, storage, and more features        |

---

## ✅ Deployment Checklist

- [ ] Database created and migrations executed
- [ ] Backend deployed and working
- [ ] Environment variables configured in backend
- [ ] Frontend deployed on Vercel
- [ ] `NEXT_PUBLIC_API_URL` variable configured in frontend
- [ ] CORS configured correctly
- [ ] Test login/register from deployed frontend
- [ ] Verify API requests work

---

## 🐛 Troubleshooting

### Backend Not Responding on Render

- Wait ~30 seconds on the first request (it's "waking up")
- Check that the service is not "sleeping" in the dashboard

### CORS Error

- Verify that `CORS_ORIGIN` in the backend has exactly the Vercel URL (with https://)
- Don't include the trailing slash `/`

### Database Connection Error

- Verify that `DATABASE_URL` has `?sslmode=require` at the end
- Make sure Render/Railway IP is allowed in Neon/Supabase

### Migrations Not Executed

- Run manually: `npx prisma migrate deploy` with production DATABASE_URL
- Or add the `postinstall` script mentioned above

---

## 🎉 Ready!

Your application should be working completely free. Remember that:

- Free plans have limits (but sufficient for development/testing)
- For production with many users, consider paid plans
- Monitor usage on each platform

Good luck with your deployment! 🚀
