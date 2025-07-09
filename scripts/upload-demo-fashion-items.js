#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFashionItemsBucket() {
  console.log('🗄️ Checking fashion-items storage bucket...');
  
  const { data, error } = await supabase.storage.getBucket('fashion-items');

  if (error) {
    console.error('❌ Fashion items bucket not found:', error);
    return false;
  }
  
  console.log('✅ Fashion items bucket found and ready');
  return true;
}

async function uploadImage(localPath, storagePath) {
  console.log(`⬆️ Uploading ${path.basename(localPath)}...`);
  
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    const { data, error } = await supabase.storage
      .from('fashion-items')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error(`❌ Failed to upload ${path.basename(localPath)}:`, error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('fashion-items')
      .getPublicUrl(storagePath);

    console.log(`✅ Uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`❌ Error uploading ${path.basename(localPath)}:`, err);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting fashion items upload...');
  
  // Check bucket exists
  const bucketExists = await checkFashionItemsBucket();
  if (!bucketExists) {
    return;
  }

  // Define image mappings
  const imagesToUpload = [
    {
      local: path.join(__dirname, '..', 'assets', 'virtual-try-on-demo', 'top-front.png'),
      storage: 'demo/ed-hardy-jacket-front.png'
    },
    {
      local: path.join(__dirname, '..', 'assets', 'virtual-try-on-demo', 'top-back.png'),
      storage: 'demo/ed-hardy-jacket-back.png'
    },
    {
      local: path.join(__dirname, '..', 'assets', 'virtual-try-on-demo', 'bottom-front.png'),
      storage: 'demo/ed-hardy-shorts-front.png'
    },
    {
      local: path.join(__dirname, '..', 'assets', 'virtual-try-on-demo', 'bottom-side.png'),
      storage: 'demo/ed-hardy-shorts-side.png'
    },
    {
      local: path.join(__dirname, '..', 'assets', 'virtual-try-on-demo', '20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png'),
      storage: 'demo/avatar-sample.png'
    }
  ];

  const uploadResults = [];

  for (const { local, storage } of imagesToUpload) {
    if (fs.existsSync(local)) {
      const url = await uploadImage(local, storage);
      if (url) {
        uploadResults.push({ local, storage, url });
      }
    } else {
      console.log(`⚠️ File not found: ${local}`);
    }
  }

  console.log('\n📋 Upload Results:');
  uploadResults.forEach(({ storage, url }) => {
    console.log(`  ${storage}: ${url}`);
  });

  console.log('\n✅ Fashion items upload complete!');
  console.log('\n🔧 Next: Update src/data/demoWardrobeItems.ts with these URLs');
}

main().catch(console.error);