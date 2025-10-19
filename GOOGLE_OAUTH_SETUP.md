# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for the Smart Alarm application, allowing users to sign in with their Google accounts.

---

## Prerequisites
- Google Account
- Smart Alarm application running locally
- Access to Google Cloud Console

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" dropdown at the top
   - Click "NEW PROJECT"
   - Enter project name: `Smart Alarm`
   - Click "CREATE"

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

---

## Step 2: Enable Google+ API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Search for Google+ API**
   - In the search bar, type "Google+ API"
   - Click on "Google+ API"

3. **Enable the API**
   - Click "ENABLE" button

---

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - In the left sidebar, click "OAuth consent screen"

2. **Select User Type**
   - Choose "External" (for testing with any Google account)
   - Click "CREATE"

3. **Fill in App Information**
   - **App name**: `Smart Alarm`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: Leave blank for now
   - **Authorized domains**: Leave blank for development
   - **Developer contact information**: Your email address
   - Click "SAVE AND CONTINUE"

4. **Scopes**
   - Click "ADD OR REMOVE SCOPES"
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

5. **Test Users** (for External apps)
   - Click "ADD USERS"
   - Add your email address and any test users
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

6. **Summary**
   - Review your settings
   - Click "BACK TO DASHBOARD"

---

## Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - In the left sidebar, click "Credentials"

2. **Create Credentials**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"

3. **Configure OAuth Client**
   - **Application type**: Web application
   - **Name**: `Smart Alarm Web Client`
   
4. **Authorized JavaScript origins**
   - Click "+ ADD URI"
   - Add: `http://localhost:3000`
   - Click "+ ADD URI"
   - Add: `http://localhost:5000`

5. **Authorized redirect URIs**
   - Click "+ ADD URI"
   - Add: `http://localhost:5000/api/auth/google/callback`

6. **Create**
   - Click "CREATE"

7. **Copy Credentials**
   - A modal will appear with your credentials
   - **Copy the Client ID**
   - **Copy the Client Secret**
   - Click "OK"

---

## Step 5: Update Environment Variables

1. **Open your `.env` file**
   ```bash
   h:\Mini_project\Smart_alarm\.env
   ```

2. **Add the following variables**
   ```env
   # Add these to your existing .env file
   SESSION_SECRET=your_random_session_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. **Replace the placeholders**
   - Replace `your_google_client_id_here` with your Client ID
   - Replace `your_google_client_secret_here` with your Client Secret
   - Generate a random session secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Example `.env` file**
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   
   # Google OAuth
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # MongoDB
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

---

## Step 6: Restart Your Servers

1. **Stop both servers** (if running)
   - Press `Ctrl+C` in both terminal windows

2. **Restart backend**
   ```bash
   npm run server
   ```

3. **Restart frontend**
   ```bash
   npm run client
   ```

   Or run both together:
   ```bash
   npm run dev
   ```

---

## Step 7: Test Google OAuth

1. **Open the application**
   - Navigate to: http://localhost:3000

2. **Click "Continue with Google"**
   - You'll be redirected to Google's login page

3. **Sign in with Google**
   - Enter your Google credentials
   - Grant permissions to the app

4. **Verify Success**
   - You should be redirected back to the dashboard
   - Check that you're logged in
   - Your profile should show your Google name and avatar

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: 
- Check that your redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- No trailing slashes
- Correct protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
**Solution**:
- Make sure OAuth consent screen is configured
- Add your email as a test user (for External apps)
- Check that required scopes are added

### Error: "Invalid client"
**Solution**:
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
- Make sure there are no extra spaces
- Restart the server after updating `.env`

### User not redirected after login
**Solution**:
- Check browser console for errors
- Verify callback URL in both Google Console and `.env`
- Check that frontend is running on port 3000

### Session errors
**Solution**:
- Make sure SESSION_SECRET is set in `.env`
- Clear browser cookies
- Restart the server

---

## Security Best Practices

### For Development
1. **Never commit `.env` file** to version control
2. **Use test users** in OAuth consent screen
3. **Keep credentials secure**

### For Production
1. **Use HTTPS** for all URLs
2. **Update authorized origins** to production domain
3. **Update redirect URIs** to production URLs
4. **Publish OAuth consent screen** (remove test mode)
5. **Use environment-specific credentials**
6. **Enable additional security features**:
   - CSRF protection
   - Rate limiting
   - IP whitelisting (if needed)

---

## Production Deployment

### Update Google Console
1. Add production domain to authorized JavaScript origins:
   ```
   https://yourdomain.com
   ```

2. Add production callback to redirect URIs:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

### Update Environment Variables
```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

### Publish OAuth Consent Screen
1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification (if needed)

---

## Features Implemented

### Backend
- ✅ Passport.js Google OAuth strategy
- ✅ Session management
- ✅ User creation/linking
- ✅ JWT token generation
- ✅ Secure callback handling

### Frontend
- ✅ Google login button
- ✅ OAuth callback handler
- ✅ Token storage
- ✅ Automatic redirect
- ✅ Error handling

### User Experience
- ✅ One-click Google sign-in
- ✅ Automatic account creation
- ✅ Account linking (if email exists)
- ✅ Profile picture from Google
- ✅ Seamless authentication flow

---

## API Endpoints

### Google OAuth Flow
```
GET /api/auth/google
→ Redirects to Google login

GET /api/auth/google/callback
→ Handles Google callback
→ Creates/finds user
→ Generates JWT token
→ Redirects to frontend with token

GET /api/auth/status
→ Check authentication status
```

---

## Database Schema Updates

### User Model
```javascript
{
  googleId: String,        // Google user ID
  avatar: String,          // Profile picture URL
  authProvider: String,    // 'local' or 'google'
  password: {              // Not required for Google users
    type: String,
    required: function() {
      return !this.googleId;
    }
  }
}
```

---

## Testing Checklist

- [ ] Google login button appears on login page
- [ ] Clicking button redirects to Google
- [ ] Can sign in with Google account
- [ ] Redirected back to dashboard after login
- [ ] User profile shows Google name and avatar
- [ ] Can access protected routes
- [ ] Can log out successfully
- [ ] Can log back in with Google
- [ ] Existing email accounts are linked properly
- [ ] New users are created correctly

---

## Additional Resources

- **Google OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Passport.js Documentation**: http://www.passportjs.org/
- **Google Cloud Console**: https://console.cloud.google.com/

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check server logs for detailed error messages
4. Ensure Google Cloud project is configured properly
5. Test with a different Google account

---

## Next Steps

After Google OAuth is working:
1. Add Facebook OAuth (similar process)
2. Add Apple Sign In
3. Implement account linking UI
4. Add profile management for OAuth users
5. Set up email verification for local accounts

---

**Status**: Ready for testing ✅
**Last Updated**: October 20, 2025
