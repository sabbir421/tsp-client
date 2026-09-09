import { BED_OPTIONS, CITIES } from './propertyFormConstants';

export const CATEGORIES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];

export const RESIDENTIAL_SUBTYPES = [
  'Brand New Apartment',
  'Used Apartment',
  'Semi Furnished Apartment',
  'Full Furnished Apartment',
  'Under construction Apartment',
  'House',
];

export const COMMERCIAL_SUBTYPES = [
  'Brand New space',
  'Used Space',
  'Under development space',
  'Shop space',
];

export const ZONES = [
  'Uttara',
  'Banani',
  'Dhanmondi',
  'Gulshan',
  'Badda',
  'Bashundhara',
  'Baridhara',
  'Mirpur',
  'Mohammadpur',
  'Khilkhet',
  'Niketan',
  'Motijheel',
  'Tejgaon',
];

export const INITIAL_REQUIREMENT_FORM = {
  category: 'residential',
  subType: 'Brand New Apartment',
  residentialNotes: '',
  bedrooms: '3',
  sizeSqFt: '',
  area: '',
  zone: 'Uttara',
  city: 'Dhaka',
  mustInclude: false,
  mustIncludeDetails: '',
  maxBudget: '',
};

export const requirementToForm = (req) => ({
  category: req.category || 'residential',
  subType: req.subType || '',
  residentialNotes: req.residentialNotes || '',
  bedrooms: req.bedrooms || '3',
  sizeSqFt: req.sizeSqFt?.toString() || '',
  area: req.area || '',
  zone: req.zone || 'Uttara',
  city: req.city || 'Dhaka',
  mustInclude: req.mustInclude || false,
  mustIncludeDetails: req.mustIncludeDetails || '',
  maxBudget: req.maxBudget?.toString() || '',
});

export { BED_OPTIONS, CITIES };
