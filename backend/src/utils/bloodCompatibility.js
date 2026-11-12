/**
 * SmartBlood - Medical Blood Compatibility Matrix
 * Determines which donor blood groups are compatible with a recipient's blood group.
 */

export const BLOOD_COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export const VALID_BLOOD_TYPES = Object.keys(BLOOD_COMPATIBILITY_MAP);

/**
 * Returns an array of compatible donor blood groups for a given recipient blood type.
 * @param {string} recipientBloodType e.g. "A+"
 * @returns {string[]} Array of compatible blood types e.g. ["O-", "O+", "A-", "A+"]
 */
export const getCompatibleDonorBloodTypes = (recipientBloodType) => {
  const normalized = recipientBloodType ? recipientBloodType.trim().toUpperCase() : '';
  return BLOOD_COMPATIBILITY_MAP[normalized] || [];
};

/**
 * Validates whether a blood type is a valid medical type.
 * @param {string} bloodType
 * @returns {boolean}
 */
export const isValidBloodType = (bloodType) => {
  return VALID_BLOOD_TYPES.includes(bloodType?.trim()?.toUpperCase());
};

