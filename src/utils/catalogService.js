import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export const DEFAULT_CATEGORIES = [];

export const DEFAULT_BRANDS = [
  { name: 'Apple',     order: 0 },
  { name: 'Samsung',   order: 1 },
  { name: 'Sony',      order: 2 },
  { name: 'LG',        order: 3 },
  { name: 'HP',        order: 4 },
  { name: 'Dell',      order: 5 },
  { name: 'Lenovo',    order: 6 },
  { name: 'Xiaomi',    order: 7 },
  { name: 'Hisense',   order: 8 },
  { name: 'Tecno',     order: 9 },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const categoriesRef = () => collection(db, 'categories');

export function listenToCategories(callback) {
  const q = query(categoriesRef(), orderBy('order', 'asc'));
  return onSnapshot(q, snap => {
    const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const fetchedNames = fetched.map(c => c.name.toLowerCase());
    const defaults = DEFAULT_CATEGORIES.filter(c => !fetchedNames.includes(c.name.toLowerCase()));
    const merged = [...defaults, ...fetched].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    callback(merged);
  });
}

export async function addCategory(data) {
  return addDoc(categoriesRef(), { ...data, createdAt: new Date() });
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id));
}

export async function seedTaxonomy() {
  const data = [
    { type: 'department', department: 'Cameras & Photography', name: 'Cameras & Photography', order: 1 },
    { type: 'category', department: 'Cameras & Photography', category: 'Cameras', name: 'Cameras', order: 1 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Cameras', subcategory: 'Point & Shoot', name: 'Point & Shoot', order: 1 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Cameras', subcategory: 'Action Cameras', name: 'Action Cameras', order: 2 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Cameras', subcategory: 'DSLR & Mirrorless', name: 'DSLR & Mirrorless', order: 3 },
    { type: 'category', department: 'Cameras & Photography', category: 'Drones & Accessories', name: 'Drones & Accessories', order: 2 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Drones & Accessories', subcategory: 'Lenses', name: 'Lenses', order: 1 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Drones & Accessories', subcategory: 'Tripods', name: 'Tripods', order: 2 },
    { type: 'subcategory', department: 'Cameras & Photography', category: 'Drones & Accessories', subcategory: 'Drones', name: 'Drones', order: 3 },

    { type: 'department', department: 'FREEZERS', name: 'FREEZERS', order: 2 },
    { type: 'category', department: 'FREEZERS', category: 'Chest Freezer', name: 'Chest Freezer', order: 1 },
    { type: 'subcategory', department: 'FREEZERS', category: 'Chest Freezer', subcategory: 'Double Door', name: 'Double Door', order: 1 },
    { type: 'subcategory', department: 'FREEZERS', category: 'Chest Freezer', subcategory: 'Single Door', name: 'Single Door', order: 2 },
    { type: 'category', department: 'FREEZERS', category: 'Standing freezer', name: 'Standing freezer', order: 2 },

    { type: 'department', department: 'TV, Audio & Home Theater', name: 'TV, Audio & Home Theater', order: 3 },
    { type: 'category', department: 'TV, Audio & Home Theater', category: 'Audio', name: 'Audio', order: 1 },
    { type: 'subcategory', department: 'TV, Audio & Home Theater', category: 'Audio', subcategory: 'Home Theater Systems', name: 'Home Theater Systems', order: 1 },
    { type: 'subcategory', department: 'TV, Audio & Home Theater', category: 'Audio', subcategory: 'Over-Ear Headphones', name: 'Over-Ear Headphones', order: 2 },
    { type: 'subcategory', department: 'TV, Audio & Home Theater', category: 'Audio', subcategory: 'Bluetooth Speakers', name: 'Bluetooth Speakers', order: 3 },

    { type: 'department', department: 'Home & Office Appliances', name: 'Home & Office Appliances', order: 4 },
    { type: 'category', department: 'Home & Office Appliances', category: 'Small Kitchen Appliances', name: 'Small Kitchen Appliances', order: 1 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Small Kitchen Appliances', subcategory: 'Blenders', name: 'Blenders', order: 1 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Small Kitchen Appliances', subcategory: 'Microwaves', name: 'Microwaves', order: 2 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Small Kitchen Appliances', subcategory: 'Air Fryers', name: 'Air Fryers', order: 3 },
    { type: 'category', department: 'Home & Office Appliances', category: 'Large Appliances', name: 'Large Appliances', order: 2 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Large Appliances', subcategory: 'Air Conditioners', name: 'Air Conditioners', order: 1 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Large Appliances', subcategory: 'Washing Machines', name: 'Washing Machines', order: 2 },
    { type: 'subcategory', department: 'Home & Office Appliances', category: 'Large Appliances', subcategory: 'Refrigerators', name: 'Refrigerators', order: 3 },

    { type: 'department', department: 'Gaming', name: 'Gaming', order: 5 },
    { type: 'category', department: 'Gaming', category: 'Accessories', name: 'Accessories', order: 1 },
    { type: 'subcategory', department: 'Gaming', category: 'Accessories', subcategory: 'Controllers', name: 'Controllers', order: 1 },
    { type: 'subcategory', department: 'Gaming', category: 'Accessories', subcategory: 'Gaming Headsets', name: 'Gaming Headsets', order: 2 },
    { type: 'category', department: 'Gaming', category: 'Consoles', name: 'Consoles', order: 2 },
    { type: 'subcategory', department: 'Gaming', category: 'Consoles', subcategory: 'Xbox', name: 'Xbox', order: 1 },
    { type: 'subcategory', department: 'Gaming', category: 'Consoles', subcategory: 'PlayStation', name: 'PlayStation', order: 2 },
    { type: 'subcategory', department: 'Gaming', category: 'Consoles', subcategory: 'Nintendo', name: 'Nintendo', order: 3 },
    { type: 'category', department: 'Gaming', category: 'Video Games', name: 'Video Games', order: 3 },
    { type: 'subcategory', department: 'Gaming', category: 'Video Games', subcategory: 'PS5 Games', name: 'PS5 Games', order: 1 },
    { type: 'subcategory', department: 'Gaming', category: 'Video Games', subcategory: 'Xbox Games', name: 'Xbox Games', order: 2 },
    { type: 'subcategory', department: 'Gaming', category: 'Video Games', subcategory: 'Nintendo Games', name: 'Nintendo Games', order: 3 },

    { type: 'department', department: 'Washing machine', name: 'Washing machine', order: 6 },
    { type: 'category', department: 'Washing machine', category: 'Front load Automatic', name: 'Front load Automatic', order: 1 },
    { type: 'subcategory', department: 'Washing machine', category: 'Front load Automatic', subcategory: 'Wash and Dry', name: 'Wash and Dry', order: 1 },
    { type: 'subcategory', department: 'Washing machine', category: 'Front load Automatic', subcategory: 'Wash and Spin', name: 'Wash and Spin', order: 2 },
    { type: 'category', department: 'Washing machine', category: 'Top loader Automatic', name: 'Top loader Automatic', order: 2 },
    { type: 'category', department: 'Washing machine', category: 'Single Tub Manual', name: 'Single Tub Manual', order: 3 },
    { type: 'category', department: 'Washing machine', category: 'twin tub Manual', name: 'twin tub Manual', order: 4 },

    { type: 'department', department: 'Phones & Wearables', name: 'Phones & Wearables', order: 7 },
    { type: 'category', department: 'Phones & Wearables', category: 'Mobile Accessories', name: 'Mobile Accessories', order: 1 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Mobile Accessories', subcategory: 'Cases', name: 'Cases', order: 1 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Mobile Accessories', subcategory: 'Power Banks', name: 'Power Banks', order: 2 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Mobile Accessories', subcategory: 'Cables', name: 'Cables', order: 3 },
    { type: 'category', department: 'Phones & Wearables', category: 'Smartphones', name: 'Smartphones', order: 2 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Smartphones', subcategory: 'iPhones', name: 'iPhones', order: 1 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Smartphones', subcategory: 'Android Phones', name: 'Android Phones', order: 2 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Smartphones', subcategory: 'Feature Phones', name: 'Feature Phones', order: 3 },
    { type: 'category', department: 'Phones & Wearables', category: 'Smartwatches & Wearables', name: 'Smartwatches & Wearables', order: 3 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Smartwatches & Wearables', subcategory: 'Fitness Trackers', name: 'Fitness Trackers', order: 1 },
    { type: 'subcategory', department: 'Phones & Wearables', category: 'Smartwatches & Wearables', subcategory: 'Smartwatches', name: 'Smartwatches', order: 2 },

    { type: 'department', department: 'Refrigerator', name: 'Refrigerator', order: 8 },
    { type: 'category', department: 'Refrigerator', category: 'Double door', name: 'Double door', order: 1 },
    { type: 'subcategory', department: 'Refrigerator', category: 'Double door', subcategory: 'Bottom freezer', name: 'Bottom freezer', order: 1 },
    { type: 'subcategory', department: 'Refrigerator', category: 'Double door', subcategory: 'Top Freezer', name: 'Top Freezer', order: 2 },
    { type: 'category', department: 'Refrigerator', category: 'Single door', name: 'Single door', order: 2 },
    { type: 'category', department: 'Refrigerator', category: 'Chiller', name: 'Chiller', order: 3 },
    { type: 'category', department: 'Refrigerator', category: 'Side by Side', name: 'Side by Side', order: 4 },
    { type: 'subcategory', department: 'Refrigerator', category: 'Side by Side', subcategory: 'Four Door', name: 'Four Door', order: 1 },

    { type: 'department', department: 'Solar system', name: 'Solar system', order: 9 },
  ];

  for (const item of data) {
    await addCategory(item);
  }
}

// ─── BRANDS ──────────────────────────────────────────────────────────────────
const brandsRef = () => collection(db, 'brands');

export function listenToBrands(callback) {
  const q = query(brandsRef(), orderBy('order', 'asc'));
  return onSnapshot(q, snap => {
    const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const fetchedNames = fetched.map(b => b.name.toLowerCase());
    const defaults = DEFAULT_BRANDS.filter(b => !fetchedNames.includes(b.name.toLowerCase()));
    const merged = [...defaults, ...fetched].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    callback(merged);
  });
}

export async function addBrand(data) {
  return addDoc(brandsRef(), { ...data, createdAt: new Date() });
}

export async function updateBrand(id, data) {
  return updateDoc(doc(db, 'brands', id), data);
}

export async function deleteBrand(id) {
  return deleteDoc(doc(db, 'brands', id));
}
