export const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Commercial', 'Land', 'Office Space'];
export const PURPOSES = ['Buy', 'Rent'];
export const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal'];
export const BED_OPTIONS = ['0', '1', '2', '3', '4', '5', '6+'];
export const BATH_OPTIONS = ['0', '1', '2', '3', '4', '5+'];
export const BALCONY_OPTIONS = ['0', '1', '2', '3', '4+'];
export const AMENITIES = [
  'Parking', 'Lift', 'Security', 'Generator', 'CCTV',
  'Gym', 'Swimming Pool', 'Garden', 'Playground',
];
export const CONTACT_METHODS = ['Call', 'WhatsApp', 'Email'];
export const BEST_TIMES = [
  'Anytime',
  'Morning (8 AM – 12 PM)',
  'Afternoon (12 PM – 5 PM)',
  'Evening (5 PM – 9 PM)',
];

export const INITIAL_FORM = {
  propertyType: 'Apartment',
  purpose: 'Buy',
  propertyFor: 'sale',
  area: '',
  sector: '',
  city: 'Dhaka',
  address: '',
  sizeSqFt: '',
  landAreaKatha: '',
  price: '',
  priceNegotiable: 'no',
  bedrooms: '3',
  bathrooms: '3',
  balcony: '2',
  floor: '',
  totalFloors: '',
  amenities: ['Parking', 'Lift', 'Security', 'Generator'],
  otherAmenity: '',
  useMap: false,
  location: 'Bashundhara R/A, Dhaka',
  contactNumber: '',
  whatsappNumber: '',
  preferredContact: ['Call'],
  bestTime: 'Anytime',
  confirmed: false,
};

export const propertyToForm = (property) => ({
  propertyType: property.propertyType,
  purpose: property.purpose,
  propertyFor: property.purpose === 'Rent' ? 'rent' : property.propertyFor || 'sale',
  area: property.area || '',
  sector: property.sector || '',
  city: property.city || 'Dhaka',
  address: property.address || '',
  sizeSqFt: property.sizeSqFt?.toString() || '',
  landAreaKatha: property.landAreaKatha?.toString() || '',
  price: property.price?.toString() || '',
  priceNegotiable: property.priceNegotiable ? 'yes' : 'no',
  bedrooms: property.bedrooms || '3',
  bathrooms: property.bathrooms || '3',
  balcony: property.balcony || '2',
  floor: property.floor?.toString() || '',
  totalFloors: property.totalFloors?.toString() || '',
  amenities: property.amenities || [],
  otherAmenity: property.otherAmenity || '',
  useMap: false,
  location: property.location || '',
  contactNumber: property.contactNumber || '',
  whatsappNumber: property.whatsappNumber || '',
  preferredContact: property.preferredContact || ['Call'],
  bestTime: property.bestTime || 'Anytime',
  confirmed: true,
});
