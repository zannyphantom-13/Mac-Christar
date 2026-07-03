export const productData = {
  flashSale: [
    { id: 'f1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', brand: 'Sony', price: 350000, oldPrice: 420000, imgUrl: '/images/earbuds.png', rating: 4.9, reviews: 342, sold: 85, category: 'Audio' },
    { id: 'f3', name: 'Samsung Galaxy Watch 6 Classic', brand: 'Samsung', price: 280000, oldPrice: 350000, imgUrl: '/images/phone.png', rating: 4.8, reviews: 215, sold: 90, category: 'Smart Watches' },
    { id: 'f4', name: 'JBL Flip 6 Portable Bluetooth Speaker', brand: 'JBL', price: 95000, oldPrice: 125000, imgUrl: '/images/earbuds.png', rating: 4.6, reviews: 540, sold: 78, category: 'Audio' },
    { id: 'f5', name: 'Hisense 1.5HP Split Air Conditioner', brand: 'Hisense', price: 320000, oldPrice: 410000, imgUrl: '/images/tv.png', rating: 4.5, reviews: 180, sold: 45, category: 'Home Appliances' }
  ],
  featured: [
    { id: 'p1', name: 'PlayStation 5 Console - Disc Edition', brand: 'Sony', price: 850000, imgUrl: '/images/ps5.png', rating: 4.9, reviews: 890, badge: 'hot', category: 'Gaming' },
    { id: 'p2', name: 'HP Envy x360 2-in-1 Laptop (Intel Core i7, 16GB RAM)', brand: 'HP', price: 1150000, imgUrl: '/images/laptop.png', rating: 4.7, reviews: 234, category: 'Laptops' },
    { id: 'p3', name: 'Apple AirPods Pro (2nd Generation)', brand: 'Apple', price: 295000, oldPrice: 320000, imgUrl: '/images/earbuds.png', rating: 4.8, reviews: 1205, badge: 'sale', category: 'Audio' },
    { id: 'p4', name: 'Samsung 50" Crystal UHD 4K Smart TV', brand: 'Samsung', price: 450000, imgUrl: '/images/tv.png', rating: 4.6, reviews: 310, category: 'Televisions' },
    { id: 'p5', name: 'Canon EOS Rebel T7 DSLR Camera', brand: 'Canon', price: 480000, imgUrl: '/images/camera.png', rating: 4.7, reviews: 185, category: 'Cameras' },
    { id: 'p6', name: 'Xbox Series X 1TB Console', brand: 'Microsoft', price: 820000, imgUrl: '/images/ps5.png', rating: 4.8, reviews: 650, category: 'Gaming' },
    { id: 'p7', name: 'MacBook Pro 14" M3 Pro', brand: 'Apple', price: 2450000, imgUrl: '/images/laptop.png', rating: 4.9, reviews: 312, category: 'Laptops' },
    { id: 'p8', name: 'Sony A7 IV Mirrorless Camera', brand: 'Sony', price: 1950000, imgUrl: '/images/camera.png', rating: 4.9, reviews: 105, category: 'Cameras' }
  ],
  newArrivals: [
    { id: 'n1', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', price: 1550000, imgUrl: '/images/phone.png', rating: 5.0, reviews: 42, badge: 'new', category: 'Smartphones' },
    { id: 'n2', name: 'Nintendo Switch OLED Model', brand: 'Nintendo', price: 380000, imgUrl: '/images/ps5.png', rating: 4.8, reviews: 512, category: 'Gaming' },
    { id: 'n3', name: 'Ninja 4qt Air Fryer', brand: 'Ninja', price: 120000, imgUrl: '/images/tv.png', rating: 4.7, reviews: 89, badge: 'new', category: 'Home Appliances' },
    { id: 'n4', name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor', brand: 'Dell', price: 420000, imgUrl: '/images/laptop.png', rating: 4.9, reviews: 28, category: 'Laptops' },
    { id: 'n5', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', price: 1350000, imgUrl: '/images/phone.png', rating: 4.9, reviews: 89, badge: 'new', category: 'Smartphones' },
    { id: 'n6', name: 'Bose QuietComfort Ultra Headphones', brand: 'Bose', price: 420000, imgUrl: '/images/earbuds.png', rating: 4.8, reviews: 65, category: 'Audio' },
    { id: 'n7', name: 'LG C3 55" OLED evo 4K TV', brand: 'LG', price: 1250000, imgUrl: '/images/tv.png', rating: 4.9, reviews: 44, category: 'Televisions' },
    { id: 'n8', name: 'Google Pixel 8 Pro 128GB', brand: 'Google', price: 950000, imgUrl: '/images/phone.png', rating: 4.7, reviews: 52, badge: 'new', category: 'Smartphones' }
  ]
};

export const allProducts = [
  ...productData.flashSale,
  ...productData.featured,
  ...productData.newArrivals
];
