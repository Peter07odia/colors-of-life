// Test script to diagnose avatar access issues
// Run this with: node test_avatar_access.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== SUPABASE CONNECTION TEST ===');
console.log('URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
console.log('Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Test with anon key (like mobile app)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Test with service key (like edge functions)
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function testAvatarAccess() {
  console.log('\n=== TESTING AVATAR ACCESS ===');
  
  try {
    // Test 1: Check if we can query user_avatars table with anon key
    console.log('\n1. Testing anon key access to user_avatars...');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('user_avatars')
      .select('id, processing_status, created_at')
      .limit(5);
    
    if (anonError) {
      console.log('❌ Anon key error:', anonError.message);
      console.log('   Details:', anonError.details);
      console.log('   Hint:', anonError.hint);
    } else {
      console.log('✅ Anon key can access user_avatars');
      console.log('   Records found:', anonData?.length || 0);
    }
    
    // Test 2: Check if we can query with service key
    if (supabaseService) {
      console.log('\n2. Testing service key access to user_avatars...');
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('user_avatars')
        .select('id, user_id, processing_status, created_at')
        .limit(5);
      
      if (serviceError) {
        console.log('❌ Service key error:', serviceError.message);
        console.log('   Details:', serviceError.details);
      } else {
        console.log('✅ Service key can access user_avatars');
        console.log('   Records found:', serviceData?.length || 0);
        if (serviceData && serviceData.length > 0) {
          console.log('   Sample record:', serviceData[0]);
        }
      }
    }
    
    // Test 3: Test authentication check
    console.log('\n3. Testing authentication status...');
    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('📱 Session status:', sessionData.session ? 'Authenticated' : 'Not authenticated');
      if (sessionData.session) {
        console.log('   User ID:', sessionData.session.user.id);
      }
    }
    
    // Test 4: Check RLS policies (service key only)
    if (supabaseService) {
      console.log('\n4. Testing RLS policy query...');
      const { data: policyData, error: policyError } = await supabaseService
        .rpc('exec_sql', { 
          sql: "SELECT policyname FROM pg_policies WHERE tablename = 'user_avatars'" 
        });
      
      if (policyError) {
        console.log('❌ RLS policy query error:', policyError.message);
      } else {
        console.log('✅ RLS policies found:', policyData);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testStorageAccess() {
  console.log('\n=== TESTING STORAGE ACCESS ===');
  
  try {
    // Test storage bucket access
    const { data: buckets, error } = await supabaseAnon.storage.listBuckets();
    
    if (error) {
      console.log('❌ Storage error:', error.message);
    } else {
      console.log('✅ Storage buckets accessible');
      console.log('   Buckets:', buckets?.map(b => b.name) || []);
      
      // Check if avatars bucket exists
      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      if (avatarsBucket) {
        console.log('✅ Avatars bucket found:', avatarsBucket);
      } else {
        console.log('❌ Avatars bucket not found');
      }
    }
  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testAvatarAccess();
  await testStorageAccess();
  
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('If you see "No API key found" errors:');
  console.log('1. Check that EXPO_PUBLIC_SUPABASE_ANON_KEY is set correctly');
  console.log('2. Verify RLS policies allow access to authenticated users');
  console.log('3. Check that the mobile app is sending the Authorization header');
  console.log('4. Ensure the user is properly authenticated before making requests');
}

runAllTests().catch(console.error);