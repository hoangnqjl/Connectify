// src/utils/formatPrice.js

/**
 * Format price from string to Vietnamese currency format
 * @param {string|number} price - Price as string or number
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (!price) return '0 VNĐ';

  // Convert string to number if needed
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;

  if (isNaN(numPrice)) return '0 VNĐ';

  // Format with thousand separators
  return new Intl.NumberFormat('vi-VN').format(numPrice) + ' VNĐ';
};

/**
 * Parse price string to number
 * @param {string} priceString - Price as string
 * @returns {number} Price as number
 */
export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  return typeof priceString === 'string' ? parseInt(priceString, 10) : priceString;
};

/**
 * Calculate total price for cart items
 * @param {Array} items - Array of cart items
 * @returns {number} Total price
 */
export const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = parsePrice(item.electronic?.price || item.price);
    return total + (itemPrice * item.quantity);
  }, 0);
};

/**
 * Format image URL for products - Compatible with original code
 * @param {string} imageName - Image file name or path
 * @returns {string} Full image URL
 */
export const formatImageUrl = (imageName) => {
  if (!imageName) return '/images/item.jpg'; // Default image

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:1512';

  // If imageName already includes full URL, return as is
  if (imageName.startsWith('http')) {
    return imageName;
  }

  // Original logic: always prepend baseUrl to imageName
  // This matches the original: `${process.env.REACT_APP_API_URL}${imageSrc}`
  return `${baseUrl}${imageName}`;
};

/**
 * Format user avatar URL
 * @param {string} avatarPath - Avatar path from API
 * @returns {string} Full avatar URL
 */
export const formatAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '/images/testavt.png'; // Default avatar

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:1512';

  // If avatarPath already includes full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // If avatarPath starts with /, it's already a relative path
  if (avatarPath.startsWith('/')) {
    return `${baseUrl}${avatarPath}`;
  }

  // Otherwise, construct the full URL
  return `${baseUrl}/images/${avatarPath}`;
};
