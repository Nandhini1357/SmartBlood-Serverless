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

export const DONOR_CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal recipient only gives to AB+
};

export const URGENCY_LEVELS = [
  { value: 'CRITICAL', label: 'Critical (< 2 Hours)', color: '#dc2626', bg: '#fee2e2' },
  { value: 'URGENT', label: 'Urgent (< 6 Hours)', color: '#ea580c', bg: '#ffedd5' },
  { value: 'NORMAL', label: 'Standard (< 24 Hours)', color: '#2563eb', bg: '#dbeafe' }
];

export const getUrgencyMeta = (level) => {
  const normalized = level ? level.toUpperCase() : 'NORMAL';
  return (
    URGENCY_LEVELS.find((u) => u.value === normalized) || {
      value: normalized,
      label: 'Standard',
      color: '#64748b',
      bg: '#f1f5f9'
    }
  );
};

export const getCompatibleDonorsForRecipient = (recipientType) => {
  if (!recipientType) return [];
  return BLOOD_COMPATIBILITY[recipientType.trim().toUpperCase()] || [];
};

export const getRecipientsForDonor = (donorType) => {
  if (!donorType) return [];
  return DONOR_CAN_DONATE_TO[donorType.trim().toUpperCase()] || [];
};
