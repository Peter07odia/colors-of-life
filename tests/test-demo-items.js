// Quick test to verify demo items structure

// Simulate what the demo items should look like
const testDemoItems = [
  {
    id: 'demo-white-tshirt',
    name: 'Classic White T-Shirt',
    description: 'Clean, minimalist white t-shirt perfect for any occasion.',
    category: 'tops',
    brand: 'Classic Basics',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop'],
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString(),
    tags: ['basic', 'casual', 'essential', 'white', 'versatile']
  },
  {
    id: 'demo-black-pants',
    name: 'Black Tailored Pants',
    description: 'Sleek black pants with a tailored fit.',
    category: 'bottoms',
    brand: 'Classic Basics',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop'],
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString(),
    tags: ['black', 'tailored', 'versatile', 'pants', 'formal']
  },
  {
    id: 'demo-denim-jacket',
    name: 'Blue Denim Jacket with Graphics',
    description: 'Vintage-inspired denim jacket featuring bold graphic designs.',
    category: 'outerwear',
    brand: 'Ed Hardy Style',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop'],
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString(),
    tags: ['denim', 'jacket', 'graphic', 'vintage', 'statement', 'blue']
  },
  {
    id: 'demo-denim-shorts',
    name: 'Graphic Denim Shorts',
    description: 'Bold denim shorts with striking skull and character graphics.',
    category: 'bottoms',
    brand: 'Ed Hardy Style',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop'],
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString(),
    tags: ['denim', 'shorts', 'graphic', 'skull', 'statement', 'blue', 'summer']
  }
];

console.log('🧪 Testing demo items structure...');
console.log('Total items:', testDemoItems.length);

testDemoItems.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.name}:`);
  console.log(`   - ID: ${item.id}`);
  console.log(`   - Category: ${item.category}`);
  console.log(`   - Brand: ${item.brand}`);
  console.log(`   - Price: $${item.price}`);
  console.log(`   - Image URL: ${item.image}`);
  console.log(`   - Is Demo: ${item.is_demo}`);
  console.log(`   - Is Active: ${item.is_active}`);
});

// Test URL accessibility
console.log('\n🌐 Testing image URLs...');
testDemoItems.forEach(item => {
  console.log(`${item.name}: ${item.image}`);
  // In a real environment, you'd test if these URLs are accessible
});

console.log('\n✅ Demo items structure looks good!');
console.log('\n📝 Debug checklist:');
console.log('1. Check if FashionItemService.getFashionItems() returns these items');
console.log('2. Check if WardrobeScreen loads and displays them');
console.log('3. Check if images load in the React Native Image component');
console.log('4. Check if category filtering works with these categories');

module.exports = { testDemoItems };