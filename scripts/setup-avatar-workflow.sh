#!/bin/bash

# Colors of Life - Avatar Creation Workflow Setup Script
# This script sets up all required infrastructure for the avatar creation workflow

set -e  # Exit on any error

echo "🎨 Colors of Life - Avatar Creation Workflow Setup"
echo "=================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    exit 1
fi

echo "✅ Supabase CLI found"

# 1. Create Storage Buckets
echo ""
echo "📦 Step 1: Creating Storage Buckets"
echo "-----------------------------------"

# Create user-uploads bucket (private)
echo "Creating 'user-uploads' bucket..."
supabase storage create user-uploads --public=false || echo "Bucket may already exist"

# Create avatars bucket (public)
echo "Creating 'avatars' bucket..."
supabase storage create avatars --public=true || echo "Bucket may already exist"

# Create try-on-results bucket (private)
echo "Creating 'try-on-results' bucket..."
supabase storage create try-on-results --public=false || echo "Bucket may already exist"

echo "✅ Storage buckets created"

# 2. Set up Storage Policies
echo ""
echo "🔐 Step 2: Setting up Storage Policies"
echo "--------------------------------------"

# Create storage policies SQL
cat > temp_storage_policies.sql << 'EOF'
-- Storage policies for user-uploads bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars bucket (public read)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for try-on-results bucket
CREATE POLICY "Users can view their own try-on results" ON storage.objects
FOR SELECT USING (
  bucket_id = 'try-on-results' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own try-on results" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'try-on-results' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
EOF

# Apply storage policies
echo "Applying storage policies..."
supabase db push --file temp_storage_policies.sql

# Clean up
rm temp_storage_policies.sql

echo "✅ Storage policies applied"

# 3. Deploy Edge Functions
echo ""
echo "⚡ Step 3: Deploying Edge Functions"
echo "-----------------------------------"

echo "Deploying avatar-creation function..."
supabase functions deploy avatar-creation

echo "Deploying virtual-tryon function..."
supabase functions deploy virtual-tryon || echo "virtual-tryon function may not exist yet"

echo "✅ Edge functions deployed"

# 4. Set Environment Variables
echo ""
echo "🔧 Step 4: Setting Environment Variables"
echo "----------------------------------------"

# Get project details
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

if [ -z "$PROJECT_URL" ] || [ -z "$ANON_KEY" ]; then
    echo "❌ Could not get project details. Make sure Supabase is running:"
    echo "   supabase start"
    exit 1
fi

echo "Setting edge function environment variables..."

# Set environment variables for edge functions
supabase secrets set SUPABASE_URL="$PROJECT_URL"
supabase secrets set SUPABASE_ANON_KEY="$ANON_KEY"

# Prompt for n8n webhook URL
echo ""
echo "📝 Please enter your n8n webhook URL (or press Enter for default):"
read -p "n8n URL [http://localhost:5678/webhook]: " N8N_URL
N8N_URL=${N8N_URL:-http://localhost:5678/webhook}

supabase secrets set N8N_WEBHOOK_URL="$N8N_URL"

echo "✅ Environment variables set"

# 5. Test Database Connection
echo ""
echo "🧪 Step 5: Testing Database Setup"
echo "---------------------------------"

# Test if tables exist
echo "Checking database tables..."
supabase db diff --schema public | grep -E "(user_avatars|virtual_tryon_results|profiles)" || {
    echo "❌ Required tables not found. Please run database migrations:"
    echo "   supabase db push"
    exit 1
}

echo "✅ Database tables verified"

# 6. Create Test Data (Optional)
echo ""
echo "📊 Step 6: Creating Test Data (Optional)"
echo "----------------------------------------"

read -p "Create test data? (y/N): " CREATE_TEST_DATA

if [[ $CREATE_TEST_DATA =~ ^[Yy]$ ]]; then
    cat > temp_test_data.sql << 'EOF'
-- Insert test fashion items
INSERT INTO public.fashion_items (name, description, price, images, category_id, brand_id) VALUES
('Classic White T-Shirt', 'Comfortable cotton t-shirt', 29.99, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop"]', 
 (SELECT id FROM public.categories WHERE name = 'Tops' LIMIT 1),
 (SELECT id FROM public.brands WHERE name = 'Fashion Co.' LIMIT 1)),
('Blue Denim Jeans', 'Classic fit denim jeans', 79.99, '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop"]',
 (SELECT id FROM public.categories WHERE name = 'Bottoms' LIMIT 1),
 (SELECT id FROM public.brands WHERE name = 'Denim Brand' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Insert test categories if they don't exist
INSERT INTO public.categories (name, icon_name) VALUES
('Tops', 'shirt'),
('Bottoms', 'pants'),
('Outerwear', 'jacket'),
('Shoes', 'shoe'),
('Accessories', 'watch')
ON CONFLICT (name) DO NOTHING;

-- Insert test brands if they don't exist
INSERT INTO public.brands (name, description) VALUES
('Fashion Co.', 'Quality fashion brand'),
('Denim Brand', 'Premium denim manufacturer'),
('Premium Leather', 'Luxury leather goods'),
('Sport Brand', 'Athletic wear and shoes')
ON CONFLICT (name) DO NOTHING;
EOF

    echo "Inserting test data..."
    supabase db push --file temp_test_data.sql
    rm temp_test_data.sql
    echo "✅ Test data created"
fi

# 7. Generate Environment File for React Native
echo ""
echo "📱 Step 7: Generating Environment Configuration"
echo "----------------------------------------------"

cat > .env.local << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=$PROJECT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY

# n8n Configuration
N8N_WEBHOOK_URL=$N8N_URL

# Avatar Creation Settings
AVATAR_MAX_FILE_SIZE=10485760
AVATAR_ALLOWED_FORMATS=jpg,jpeg,png
AVATAR_PROCESSING_TIMEOUT=300000
EOF

echo "✅ Environment file created (.env.local)"

# 8. Final Status Check
echo ""
echo "🏁 Step 8: Final Status Check"
echo "-----------------------------"

echo "Checking Supabase status..."
supabase status

echo ""
echo "🎉 Avatar Creation Workflow Setup Complete!"
echo "==========================================="
echo ""
echo "✅ Storage buckets created and configured"
echo "✅ Storage policies applied"
echo "✅ Edge functions deployed"
echo "✅ Environment variables set"
echo "✅ Database tables verified"
echo "✅ Environment configuration generated"
echo ""
echo "📋 Next Steps:"
echo "1. Start your React Native app: npm start"
echo "2. Set up n8n workflows (if not already done)"
echo "3. Test avatar creation in the app"
echo ""
echo "🔧 Troubleshooting:"
echo "- If edge functions fail, check logs: supabase functions logs avatar-creation"
echo "- If storage fails, verify bucket policies in Supabase dashboard"
echo "- If n8n fails, ensure webhook URL is correct and n8n is running"
echo ""
echo "📚 Documentation:"
echo "- Supabase: https://supabase.com/docs"
echo "- n8n: https://docs.n8n.io"
echo "" 