import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const DEFAULT_CATEGORIES = [];
export const DEFAULT_BRANDS = [];

export function listenToCategories(callback) {
  const categoriesRef = collection(db, 'categories');
  const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error("Error fetching categories:", error);
    callback([]);
  });
  return unsubscribe;
}

export async function addCategory(data) {
  try {
    const docRef = doc(collection(db, 'categories'));
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

export async function updateCategory(id, data) {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

export function listenToBrands(callback) {
  const brandsRef = collection(db, 'brands');
  const unsubscribe = onSnapshot(brandsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error("Error fetching brands:", error);
    callback([]);
  });
  return unsubscribe;
}

export async function addBrand(data) {
  try {
    const docRef = doc(collection(db, 'brands'));
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding brand:", error);
    throw error;
  }
}

export async function updateBrand(id, data) {
  try {
    const docRef = doc(db, 'brands', id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
}

export async function deleteBrand(id) {
  try {
    const docRef = doc(db, 'brands', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
}

export async function seedTaxonomy() {
  return Promise.resolve();
}
