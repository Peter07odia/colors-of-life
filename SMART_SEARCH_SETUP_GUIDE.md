# Colors of Life - Smart Search Workflow Setup Guide

## 🎯 Overview

This guide will help you set up the comprehensive smart search workflow for your Colors of Life fashion app. The workflow combines:
- **Database Search** (Supabase)
- **Web Search** (Brave API)
- **Image Analysis** (OpenAI GPT-4 Vision)
- **Intelligent Query Processing** (AI-powered color/style detection)

## 📋 Prerequisites

### 1. API Keys Required
- **Supabase** (Already configured in your app)
- **Brave Search API** (Free tier available)
- **OpenAI API** (For image analysis)

### 2. n8n Cloud Account
- Access to n8n cloud service
- Admin privileges to import workflows

## 🔧 Setup Steps

### Step 1: Import Workflow

1. **Log into your n8n cloud service**
2. **Navigate to Workflows** → **Import Workflow**
3. **Copy the JSON** from `colorsoflife-smart-search-workflow.json`
4. **Paste and Import** the workflow

### Step 2: Configure Environment Variables

In your n8n cloud service, go to **Settings** → **Environment Variables** and add:

```bash
# Required API Keys
BRAVE_API_KEY=your_brave_search_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: If different from default Supabase connection
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Step 3: Configure Supabase Connection

1. **Go to the Database Search node**
2. **Configure Supabase credentials**:
   - Project URL: `https://jiwiclemrwjojoewmcnc.supabase.co`
   - API Key: Your Supabase anon key
3. **Test the connection**

### Step 4: Configure HTTP Authentication

1. **Web Search node**: Set up Brave API authentication
2. **Image Search node**: Set up OpenAI API authentication

## 🔑 API Key Setup

### Brave Search API
1. **Visit**: [Brave Search API](https://api.search.brave.com)
2. **Sign up** for free account
3. **Get API key** from dashboard
4. **Free tier**: 1,000 requests/month

### OpenAI API
1. **Visit**: [OpenAI Platform](https://platform.openai.com)
2. **Create account** and add billing
3. **Generate API key** from dashboard
4. **Pricing**: ~$0.01 per image analysis

## 📡 Webhook Endpoint

After importing, your webhook will be available at:
```
https://your-n8n-domain.com/webhook/smart-search
```

## 🧪 Testing the Workflow

### Text Search Example
```bash
curl -X POST https://your-n8n-domain.com/webhook/smart-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "red summer dress",
    "userId": "test_user",
    "maxResults": 10,
    "filters": {
      "colors": ["red"],
      "priceRange": {"min": 20, "max": 100}
    }
  }'
```

### Image Search Example
```bash
curl -X POST https://your-n8n-domain.com/webhook/smart-search \
  -H "Content-Type: application/json" \
  -d '{
    "searchType": "image",
    "imageUri": "https://example.com/dress-image.jpg",
    "userId": "test_user",
    "maxResults": 15
  }'
```

## 📱 Frontend Integration

Update your `smartSearchService.ts`:

```typescript
// src/services/smartSearchService.ts
const N8N_WEBHOOK_URL = 'https://your-n8n-domain.com/webhook/smart-search';

export const smartSearchService = {
  async searchFashion(params: SearchParams): Promise<SearchResults> {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          userId: params.userId,
          searchType: params.searchType || 'text',
          imageUri: params.imageUri,
          maxResults: params.maxResults || 20,
          offset: params.offset || 0,
          filters: {
            colors: params.colors || [],
            categories: params.categories || [],
            priceRange: params.priceRange,
            brands: params.brands || [],
            source: params.source || 'all'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Smart search error:', error);
      throw error;
    }
  }
};
```

## 🎨 Features Included

### 1. **Advanced Query Processing**
- Automatic color detection (black, white, red, blue, etc.)
- Style recognition (casual, formal, party, etc.)
- Category detection (dresses, tops, shoes, etc.)
- Brand recognition (Nike, Adidas, Zara, etc.)
- Price range detection (budget, luxury, etc.)

### 2. **Multi-Source Search**
- **Database**: Your Supabase fashion_items table
- **Web**: Brave Search API for broader results
- **Image**: OpenAI GPT-4 Vision for image analysis

### 3. **Intelligent Ranking**
- Relevance scoring based on:
  - Color matching
  - Text similarity
  - Category alignment
  - Featured item status
  - Popularity scores
  - Price range matching

### 4. **Response Format**
```json
{
  "success": true,
  "query": {
    "original": "red summer dress",
    "expanded": "red summer dress red summer dresses fashion clothing",
    "colors": ["red"],
    "category": "dresses",
    "style": "summer",
    "intent": "shopping"
  },
  "results": [
    {
      "id": "item_123",
      "title": "Floral Red Summer Dress",
      "description": "Beautiful red summer dress perfect for warm weather",
      "price": "$45.99",
      "originalPrice": "$65.99",
      "brand": "Summer Style",
      "category": "Dresses",
      "colors": ["red"],
      "images": ["https://example.com/image1.jpg"],
      "source": "database",
      "relevanceScore": 85,
      "discount": 30
    }
  ],
  "metadata": {
    "totalResults": 15,
    "databaseResults": 8,
    "webResults": 7,
    "hasImageAnalysis": false,
    "averageRelevanceScore": 72,
    "searchSources": ["database", "web"],
    "searchId": "search_1234567890_abc123",
    "userId": "test_user",
    "searchType": "text",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "suggestions": {
    "popularSearches": ["dresses", "casual wear", "formal attire"],
    "searchTips": ["Use specific color names", "Try style + occasion"],
    "relatedColors": ["red", "pink", "burgundy"],
    "relatedCategories": ["dresses", "tops", "accessories"]
  }
}
```

## 🚀 Activation

1. **Test the workflow** with sample data
2. **Activate the workflow** in n8n
3. **Update your frontend** to use the new endpoint
4. **Monitor execution logs** for any issues

## 🔍 Troubleshooting

### Common Issues:
- **Supabase connection**: Check URL and API key
- **Brave API**: Verify API key and quota
- **OpenAI API**: Check API key and billing
- **Webhook timeout**: Increase timeout settings

### Debug Mode:
The workflow includes comprehensive logging. Check execution logs in n8n for detailed information.

## 📊 Performance Optimization

### Caching Strategy:
- Cache popular searches
- Cache image analysis results
- Implement result pagination

### Rate Limiting:
- Brave API: 1,000 requests/month (free)
- OpenAI API: Rate limited by plan
- Supabase: Based on your plan

## 🔄 Next Steps

1. **Test thoroughly** with your existing data
2. **Monitor API usage** and costs
3. **Optimize query processing** based on user behavior
4. **Add more data sources** as needed
5. **Implement caching** for better performance

## 📞 Support

If you encounter issues:
1. Check n8n execution logs
2. Verify API key configurations
3. Test individual nodes
4. Review webhook request format

The workflow is now ready for production use with your Colors of Life fashion app! 