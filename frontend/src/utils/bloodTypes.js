export const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const BLOOD_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export const URGENCY_LEVELS = [
  { value: 'CRITICAL', label: 'Critical (< 2 Hours)', color: '#ef4444' },
  { value: 'URGENT', label: 'Urgent (< 6 Hours)', color: '#f97316' },
  { value: 'NORMAL', label: 'Standard (< 24 Hours)', color: '#3b82f6' }
];
