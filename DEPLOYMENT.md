# Deployment Guide

## Environment Variables

This project requires the following environment variables to be set:

### Required Variables

#### `GITHUB_ACCESS_TOKEN` (Server-side only)
- **Purpose:** Authenticate with GitHub API to fetch repository data for project pages
- **How to obtain:** 
  1. Go to https://github.com/settings/tokens/new
  2. Give it a name: "Portfolio Website - Vercel"
  3. Select scope: `public_repo` (to read public repository data)
  4. Click "Generate token"
  5. Copy the token immediately (you won't be able to see it again)
- **Where to add:**
  - **Vercel:** Settings → Environment Variables
  - **Local:** `.env` file in the root directory

### Optional Variables

#### `PUBLIC_GOOGLE_TAG_KEY`
- **Purpose:** Google Analytics tracking
- **Format:** `G-XXXXXXXXXX`

#### `PUBLIC_VERCEL_URL` / `PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` / `PUBLIC_VERCEL_ENV`
- **Purpose:** Auto-injected by Vercel for deployment context
- **Note:** No need to manually set these on Vercel

## Vercel Deployment

### First-time Setup

1. **Connect your repository** to Vercel
2. **Add environment variables:**
   - Go to your project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add `GITHUB_ACCESS_TOKEN` (see above)
   - Add `PUBLIC_GOOGLE_TAG_KEY` (optional)
3. **Deploy** - Vercel will automatically deploy on push to main branch

### Updating Environment Variables

1. Go to **Settings** → **Environment Variables** in Vercel dashboard
2. Update the variable value
3. **Important:** You must redeploy for changes to take effect
   - Either push a new commit
   - Or go to **Deployments** → Click "⋯" on latest deployment → "Redeploy"

## Local Development

1. Copy `.env.example` to `.env` (if not already done)
2. Add your `GITHUB_ACCESS_TOKEN`
3. Run `bun dev`

## Troubleshooting

### "Unauthorized" error when accessing project pages

**Symptom:** Project pages fail to load with "Unauthorized" error in logs

**Cause:** `GITHUB_ACCESS_TOKEN` is not set or invalid

**Solution:**
1. Verify the environment variable is set in Vercel
2. Check the token hasn't expired (regenerate if needed)
3. Ensure the token has `public_repo` scope
4. Redeploy after updating the environment variable

### Rate limiting issues

**Symptom:** GitHub API requests fail with 403 status

**Cause:** Making too many requests without authentication

**Solution:** Ensure `GITHUB_ACCESS_TOKEN` is set - authenticated requests have much higher rate limits (5000/hour vs 60/hour)

## Security Notes

- ⚠️ **Never commit `.env` to git** - it's in `.gitignore` for this reason
- ⚠️ **Never share your GitHub token** in public channels
- ⚠️ **Rotate tokens regularly** for security
- ⚠️ Use tokens with **minimal required scopes** (just `public_repo` for this project)
