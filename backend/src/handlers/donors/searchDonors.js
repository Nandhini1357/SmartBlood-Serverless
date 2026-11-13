import { withErrorHandler } from '../../middleware/errorHandler.js';
import { listDonors } from '../../services/donorService.js';
import { success } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const bloodType = event.queryStringParameters?.bloodType || null;
  const city = event.queryStringParameters?.city || null;
  const donors = await listDonors({ bloodType, city });

  const sanitized = donors.map((d) => {
    const nameParts = d.name ? d.name.trim().split(/\s+/) : [];
    const displayName =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1][0]}.`
        : nameParts[0] || 'Verified Donor';

    return {
      donorId: d.donorId,
      displayName,
      bloodType: d.bloodType,
      city: d.city,
      distanceKm: null,
      isAvailable: d.isAvailable
    };
  });

  return success(sanitized);
});

