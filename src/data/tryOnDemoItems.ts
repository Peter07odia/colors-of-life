// Demo items for virtual try-on using YOUR actual demo images
// These will appear in the Virtual Changing Room for testing the try-on functionality

export const tryOnDemoItems = [
  {
    id: 'demo-stylish-simplicity',
    name: 'Stylish Simplicity Outfit',
    category: 'tops',
    price: 29.99,
    brand: 'Demo Collection',
    image: require('../../../assets/demo/20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png'),
    isFavorite: true,
    dateAdded: '2024-01-15',
    description: 'Complete stylish simplicity outfit from your demo collection',
    demoAssetName: '20250408_1616_Stylish Simplicity Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png'
  },
  {
    id: 'demo-top-front',
    name: 'Demo Top (Front View)',
    category: 'tops',
    price: 49.99,
    brand: 'Demo Collection',
    image: require('../../../assets/demo/top-front.png'),
    isFavorite: true,
    dateAdded: '2024-01-13',
    description: 'Front view of demo top garment from your collection',
    demoAssetName: 'top-front.png'
  },
  {
    id: 'demo-top-back',
    name: 'Demo Top (Back View)',
    category: 'tops',
    price: 49.99,
    brand: 'Demo Collection',
    image: require('../../../assets/demo/tpp-back.png'),
    isFavorite: false,
    dateAdded: '2024-01-13',
    description: 'Back view of demo top garment from your collection',
    demoAssetName: 'tpp-back.png'
  },
  {
    id: 'demo-bottom-front',
    name: 'Demo Bottom (Front View)',
    category: 'bottoms',
    price: 79.99,
    brand: 'Demo Collection',
    image: require('../../../assets/demo/bottom-front.png'),
    isFavorite: true,
    dateAdded: '2024-01-12',
    description: 'Front view of demo bottom garment from your collection',
    demoAssetName: 'bottom-front.png'
  },
  {
    id: 'demo-bottom-side',
    name: 'Demo Bottom (Side View)',
    category: 'bottoms',
    price: 79.99,
    brand: 'Demo Collection',
    image: require('../../../assets/demo/bottom-side.png'),
    isFavorite: false,
    dateAdded: '2024-01-12',
    description: 'Side view of demo bottom garment from your collection',
    demoAssetName: 'bottom-side.png'
  }
];

export default tryOnDemoItems;