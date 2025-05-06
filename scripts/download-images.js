const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const createDirs = () => {
  const dirs = [
    'public/images',
    'public/images/feed',
    'public/images/avatars',
    'public/images/products',
    'public/images/brands'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create a placeholder image
const createPlaceholder = (filepath, width, height, text) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2A2A2A"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  fs.writeFileSync(filepath, svg);
};

// Create placeholder images
const createPlaceholders = () => {
  createDirs();
  
  // Create feed images
  for (let i = 1; i <= 6; i++) {
    const filepath = path.join('public', 'images', 'feed', `style${i}.jpg`);
    createPlaceholder(filepath, 720, 1280, `Style Image ${i}`);
    console.log(`Created feed placeholder ${i}`);
  }
  
  // Create avatar images
  for (let i = 1; i <= 6; i++) {
    const filepath = path.join('public', 'images', 'avatars', `style${i}.jpg`);
    createPlaceholder(filepath, 128, 128, `Avatar ${i}`);
    console.log(`Created avatar placeholder ${i}`);
  }
  
  // Create product images
  for (let i = 1; i <= 6; i++) {
    const filepath = path.join('public', 'images', 'products', `product${i}.jpg`);
    createPlaceholder(filepath, 400, 400, `Product ${i}`);
    console.log(`Created product placeholder ${i}`);
  }
  
  // Create brand logos
  const brands = ['zara', 'prada', 'nike', 'cos', 'reformation', 'lululemon'];
  brands.forEach(brand => {
    const filepath = path.join('public', 'images', 'brands', `${brand}.png`);
    createPlaceholder(filepath, 100, 100, brand.toUpperCase());
    console.log(`Created brand logo for ${brand}`);
  });
  
  // Create placeholder images
  const placeholders = {
    'placeholder.jpg': [720, 1280, 'Image Not Found'],
    'placeholder-thumb.jpg': [360, 640, 'Thumbnail'],
    'avatar-placeholder.jpg': [128, 128, 'Avatar'],
    'product-placeholder.jpg': [400, 400, 'Product']
  };
  
  Object.entries(placeholders).forEach(([filename, [width, height, text]]) => {
    const filepath = path.join('public', 'images', filename);
    createPlaceholder(filepath, width, height, text);
    console.log(`Created placeholder: ${filename}`);
  });
};

// Run the script
createPlaceholders(); 