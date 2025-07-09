// Add demo clothing items to Supabase database
// Run with: node add-demo-items.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const demoItems = [
  {
    name: 'Demo Top (Front View)',
    description: 'Front view of demo top garment from your collection',
    price: 49.99,
    images: ['assets/demo/top-front.png'],
    tags: ['demo', 'top', 'front-view'],
    is_active: true,
    is_demo: true
  },
  {
    name: 'Demo Top (Back View)',
    description: 'Back view of demo top garment from your collection',
    price: 49.99,
    images: ['assets/demo/tpp-back.png'],
    tags: ['demo', 'top', 'back-view'],
    is_active: true,
    is_demo: true
  },
  {
    name: 'Demo Bottom (Front View)',
    description: 'Front view of demo bottom garment from your collection',
    price: 79.99,
    images: ['assets/demo/bottom-front.png'],
    tags: ['demo', 'bottom', 'front-view'],
    is_active: true,
    is_demo: true
  },
  {
    name: 'Demo Bottom (Side View)',
    description: 'Side view of demo bottom garment from your collection',
    price: 79.99,
    images: ['assets/demo/bottom-side.png'],
    tags: ['demo', 'bottom', 'side-view'],
    is_active: true,
    is_demo: true
  }
];

async function addDemoItems() {
  try {
    console.log('Adding demo items to database...');
    
    const { data, error } = await supabase
      .from('fashion_items')
      .insert(demoItems)
      .select();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('✅ Successfully added demo items:', data.length);
    data.forEach(item => {
      console.log(`- ${item.name} (ID: ${item.id})`);
    });
    
  } catch (error) {
    console.error('Failed to add demo items:', error);
  }
}

addDemoItems();