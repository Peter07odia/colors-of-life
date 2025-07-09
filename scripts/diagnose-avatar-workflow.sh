#!/bin/bash

# Colors of Life - Avatar Workflow Diagnostic Script
# This script checks the current status of all avatar workflow components

echo "🔍 Avatar Workflow Diagnostic Report"
echo "===================================="
echo ""

# Check Supabase Status
echo "📊 1. Supabase Status"
echo "---------------------"
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed"
    
    if supabase status &> /dev/null; then
        echo "✅ Supabase is running"
        supabase status | grep -E "(API URL|anon key|service_role key)"
    else
        echo "❌ Supabase is not running - run 'supabase start'"
    fi
else
    echo "❌ Supabase CLI not installed"
fi

echo ""

# Check Storage Buckets
echo "🪣 2. Storage Buckets"
echo "--------------------"
BUCKETS=("user-uploads" "avatars" "try-on-results")

for bucket in "${BUCKETS[@]}"; do
    if supabase storage list "$bucket" &> /dev/null; then
        echo "✅ Bucket '$bucket' exists"
    else
        echo "❌ Bucket '$bucket' missing"
    fi
done

echo ""

# Check Edge Functions
echo "⚡ 3. Edge Functions"
echo "-------------------"
FUNCTIONS=("avatar-creation" "virtual-tryon")

for func in "${FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        echo "✅ Function '$func' source exists"
        
        # Check if deployed (this will show error if not deployed, but that's expected)
        if supabase functions list | grep -q "$func"; then
            echo "✅ Function '$func' deployed"
        else
            echo "❌ Function '$func' not deployed"
        fi
    else
        echo "❌ Function '$func' source missing"
    fi
done

echo ""

# Check Database Tables
echo "🗄️  4. Database Tables"
echo "----------------------"
TABLES=("profiles" "user_avatars" "virtual_tryon_results" "fashion_items" "categories" "brands")

for table in "${TABLES[@]}"; do
    if supabase db diff --schema public | grep -q "CREATE TABLE.*$table" 2>/dev/null; then
        echo "✅ Table '$table' exists"
    else
        echo "❌ Table '$table' missing or not in schema"
    fi
done

echo ""

# Check Environment Variables
echo "🔧 5. Environment Variables"
echo "---------------------------"
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check required variables
    ENV_VARS=("EXPO_PUBLIC_SUPABASE_URL" "EXPO_PUBLIC_SUPABASE_ANON_KEY" "N8N_WEBHOOK_URL")
    
    for var in "${ENV_VARS[@]}"; do
        if grep -q "$var" .env.local; then
            echo "✅ $var configured"
        else
            echo "❌ $var missing"
        fi
    done
else
    echo "❌ .env.local file missing"
fi

echo ""

# Check n8n Workflows
echo "🔄 6. n8n Workflows"
echo "-------------------"
N8N_WORKFLOWS=("avatar-creation-workflow.json" "FINAL_AVATAR_CREATION_WORKFLOW.json")

for workflow in "${N8N_WORKFLOWS[@]}"; do
    if [ -f "n8n-workflows/$workflow" ]; then
        echo "✅ Workflow '$workflow' exists"
    else
        echo "❌ Workflow '$workflow' missing"
    fi
done

# Check if n8n is running (basic check)
if curl -s http://localhost:5678/healthz &> /dev/null; then
    echo "✅ n8n appears to be running on localhost:5678"
else
    echo "❌ n8n not accessible on localhost:5678"
fi

echo ""

# Check React Native Dependencies
echo "📱 7. React Native Dependencies"
echo "-------------------------------"
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check key dependencies
    DEPS=("@supabase/supabase-js" "@react-native-async-storage/async-storage" "expo-image-picker" "zustand")
    
    for dep in "${DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo "✅ $dep installed"
        else
            echo "❌ $dep missing"
        fi
    done
else
    echo "❌ package.json missing"
fi

echo ""

# Check TypeScript Configuration
echo "📝 8. TypeScript Configuration"
echo "------------------------------"
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json exists"
else
    echo "❌ tsconfig.json missing"
fi

# Check for TypeScript errors in key files
KEY_FILES=("src/components/screens/VirtualChangingRoomScreen.tsx" "supabase/functions/avatar-creation/index.ts")

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""

# Summary and Recommendations
echo "📋 9. Summary & Recommendations"
echo "-------------------------------"

# Count issues
ISSUES=0

# Check critical components
if ! command -v supabase &> /dev/null; then
    echo "🚨 CRITICAL: Install Supabase CLI"
    ((ISSUES++))
fi

if ! supabase status &> /dev/null; then
    echo "🚨 CRITICAL: Start Supabase (supabase start)"
    ((ISSUES++))
fi

if [ ! -f ".env.local" ]; then
    echo "🚨 CRITICAL: Create environment configuration"
    ((ISSUES++))
fi

if [ ! -d "supabase/functions/avatar-creation" ]; then
    echo "🚨 CRITICAL: Avatar creation function missing"
    ((ISSUES++))
fi

if ! curl -s http://localhost:5678/healthz &> /dev/null; then
    echo "⚠️  WARNING: n8n not running - avatar processing will fail"
    ((ISSUES++))
fi

echo ""

if [ $ISSUES -eq 0 ]; then
    echo "🎉 All systems appear to be working!"
    echo "✅ Ready to test avatar creation workflow"
else
    echo "❌ Found $ISSUES issues that need attention"
    echo ""
    echo "🔧 Quick Fix Commands:"
    echo "1. Run setup script: ./setup-avatar-workflow.sh"
    echo "2. Start Supabase: supabase start"
    echo "3. Start n8n: npx n8n start (in separate terminal)"
    echo "4. Deploy functions: supabase functions deploy avatar-creation"
fi

echo ""
echo "📚 For detailed setup, run: ./setup-avatar-workflow.sh"
echo "🔍 For logs, run: supabase functions logs avatar-creation"
echo "" 