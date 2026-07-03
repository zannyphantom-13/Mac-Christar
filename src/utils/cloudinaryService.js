/**
 * Service to handle uploading images to Cloudinary via unsigned upload
 */

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dshrculvx/image/upload';
const UPLOAD_PRESET = 'electricplug';

/**
 * Uploads an image file to Cloudinary.
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 * @throws {Error} If the upload fails
 */
export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};
