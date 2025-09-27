import { Destination, CartItem } from '../types';

/**
 * Get the appropriate price based on language
 * @param destination - The destination object
 * @param language - Current language ('id' or 'en')
 * @returns The price to display
 */
export function getPriceByLanguage(destination: Destination, language: string): number {
  if (language === 'en' && destination.mancanegara !== undefined && destination.mancanegara !== null) {
    return destination.mancanegara;
  }
  return destination.harga || 0;
}

/**
 * Get the appropriate price for cart item based on language
 * @param cartItem - The cart item object
 * @param language - Current language ('id' or 'en')
 * @returns The price to display
 */
export function getCartItemPriceByLanguage(cartItem: CartItem, language: string): number {
  if (language === 'en' && cartItem.mancanegara !== undefined && cartItem.mancanegara !== null) {
    return cartItem.mancanegara;
  }
  return cartItem.harga || 0;
}

/**
 * Format price with currency based on language
 * @param price - The price to format
 * @param language - Current language ('id' or 'en')
 * @returns Formatted price string
 */
export function formatPrice(price: number, language: string): string {
  if (language === 'en') {
    return `$${price.toLocaleString('en-US')}`;
  }
  return `Rp ${price.toLocaleString('id-ID')}`;
}

/**
 * Get the appropriate price for vehicle based on language
 * @param vehicle - The vehicle object with harga and mancanegara
 * @param language - Current language ('id' or 'en')
 * @returns The price to display
 */
export function getVehiclePriceByLanguage(vehicle: { harga: number; mancanegara?: number }, language: string): number {
  if (language === 'en' && vehicle.mancanegara !== undefined && vehicle.mancanegara !== null) {
    return vehicle.mancanegara;
  }
  return vehicle.harga;
}

/**
 * Create cart item with appropriate pricing
 * @param destination - The destination object
 * @param language - Current language ('id' or 'en')
 * @returns Cart item with correct pricing
 */
export function createCartItemWithPricing(destination: Destination, language: string): CartItem {
  return {
    id: destination.id,
    nama: destination.nama,
    harga: destination.harga,
    mancanegara: destination.mancanegara,
    slug: destination.slug
  };
}

