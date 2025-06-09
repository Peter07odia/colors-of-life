# 🚀 AI Virtual Try-On Integration Setup Guide

This guide will help you set up the complete AI virtual try-on system using n8n, Kling AI, OpenAI, and Supabase.

## 📋 Prerequisites

- n8n running locally on `http://localhost:5678` ✅ (Already running)
- Supabase project with database and edge functions
- OpenAI API key for background removal
- Kling AI API key for virtual try-on

## 🏗️ Setup Steps

### 1. Database Setup

First, apply the new database schema to your Supabase project:

```sql
-- Run this in your Supabase SQL editor
-- This will create the new tables for avatars and virtual try-on results
-- Copy and paste the content from database-schema.sql
```

### 2. Environment Variables Setup

Add these environment variables to your Supabase project:

```bash
# In Supabase Dashboard -> Settings -> Environment Variables
N8N_AVATAR_WEBHOOK_URL=http://localhost:5678/webhook/avatar-creation
N8N_VIRTUAL_TRYON_WEBHOOK_URL=http://localhost:5678/webhook/virtual-tryon
```

### 3. Deploy Supabase Edge Functions

```bash
# Deploy the avatar creation function
supabase functions deploy avatar-creation

# Deploy the virtual try-on function
supabase functions deploy virtual-tryon
```

### 4. n8n Workflow Setup

#### Step 4.1: Import Avatar Creation Workflow

1. Open n8n at `http://localhost:5678`
2. Click on "Workflows" → "Import from File"
3. Import `n8n-workflows/avatar-creation-workflow.json`
4. Configure the following credentials:

**OpenAI Credentials:**
- Name: `openai-credentials`
- API Key: Your OpenAI API key

**Supabase Credentials:**
- Name: `supabase-credentials`
- URL: Your Supabase project URL
- API Key: Your Supabase service role key

#### Step 4.2: Import Virtual Try-On Workflow

1. Import `n8n-workflows/virtual-tryon-workflow.json`
2. Configure the following credentials:

**Kling AI Credentials:**
- Create new HTTP Header Auth credential
- Name: `kling-ai-credentials`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_KLING_AI_API_KEY`

#### Step 4.3: Activate Workflows

1. Open each workflow
2. Click the "Activate" toggle in the top right
3. Copy the webhook URLs from each workflow:
   - Avatar Creation: `http://localhost:5678/webhook/avatar-creation`
   - Virtual Try-On: `http://localhost:5678/webhook/virtual-tryon`

### 5. Update Environment Variables in Supabase

Update your Supabase environment variables with the webhook URLs:

```bash
N8N_AVATAR_WEBHOOK_URL=http://localhost:5678/webhook/avatar-creation
N8N_VIRTUAL_TRYON_WEBHOOK_URL=http://localhost:5678/webhook/virtual-tryon
```

### 6. React Native App Setup

Install required dependencies:

```bash
npm install expo-av expo-image-picker
```

### 7. Testing the Integration

#### Test Avatar Creation:

1. Open your React Native app
2. Go to Virtual Changing Room
3. Tap "Create Avatar"
4. Select a photo from your library
5. Wait for processing (30-60 seconds)
6. Check n8n execution logs for any errors

#### Test Virtual Try-On:

1. Ensure you have an avatar created
2. Select clothing items from the wardrobe
3. Tap "Try On Now"
4. Wait for processing (30-90 seconds)
5. View the generated video/image result

## 🔧 API Keys Required

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to n8n credentials

### Kling AI API Key
1. Visit [Kling AI Documentation](https://docs.qingque.cn/d/home/eZQDkhg4h2Qg8SEVSUTBdzYeY?identityId=1oEG9JKKMFv)
2. Sign up and get your API key
3. Add it to n8n credentials

## 📁 File Structure

```
├── supabase/
│   ├── functions/
│   │   ├── avatar-creation/
│   │   │   └── index.ts
│   │   ├── virtual-tryon/
│   │   │   └── index.ts
│   │   └── _shared/
│   │       └── cors.ts
├── src/
│   ├── services/
│   │   └── virtualTryOnService.ts
│   └── components/
│       └── screens/
│           └── VirtualChangingRoomScreen.tsx
├── n8n-workflows/
│   ├── avatar-creation-workflow.json
│   └── virtual-tryon-workflow.json
├── database-schema.sql
└── SETUP_GUIDE.md
```

## 🚨 Troubleshooting

### Common Issues:

1. **n8n webhook not accessible:**
   - Ensure n8n is running on `localhost:5678`
   - Check firewall settings
   - For production, use a public n8n instance

2. **Avatar creation fails:**
   - Verify OpenAI API key
   - Check image format and size
   - Review n8n execution logs

3. **Virtual try-on timeout:**
   - Kling AI can take 30-90 seconds
   - Check API limits and credits
   - Verify image URLs are accessible

4. **Supabase permission errors:**
   - Ensure RLS policies are set correctly
   - Verify service role key permissions

### Debug Steps:

1. Check n8n execution logs
2. View Supabase function logs
3. Test API endpoints individually
4. Verify all credentials are correct

## 🎯 Production Deployment

For production deployment:

1. **Deploy n8n to cloud:**
   - Use n8n Cloud or self-host on AWS/DigitalOcean
   - Update webhook URLs in Supabase

2. **Set up proper CORS:**
   - Configure CORS for your domain
   - Update Supabase CORS settings

3. **Add error monitoring:**
   - Implement Sentry or similar
   - Monitor API usage and costs

4. **Scale considerations:**
   - Use queue system for high volume
   - Implement caching for avatars
   - Monitor AI API costs

## 📊 Monitoring & Analytics

Track these metrics:
- Avatar creation success rate
- Virtual try-on completion time
- User engagement with results
- API costs and usage

## 🔄 Workflow Details

### Avatar Creation Workflow:
1. Receive user photo (base64)
2. Process with OpenAI background removal
3. Upload to Supabase storage
4. Save avatar record to database
5. Return avatar URL

### Virtual Try-On Workflow:
1. Receive avatar and clothing item
2. Send to Kling AI for processing
3. Poll for completion
4. Save result URLs to database
5. Return success response

## 📝 Next Steps

1. Add more clothing categories
2. Implement outfit combinations
3. Add social sharing features
4. Optimize for performance
5. Add analytics dashboard

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Review n8n and Supabase logs
3. Test individual components
4. Document errors for debugging

---

**Happy virtual try-on building!** 🎉 