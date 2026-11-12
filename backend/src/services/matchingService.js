/**
 * SmartBlood - Intelligent Matching Engine
 * Matches blood requests with medically compatible, nearby, and available donors.
 * Protects donor privacy by withholding unneeded PII from match listings.
 */
import { getBloodRequestById } from './requestService.js';
import { getAvailableDonorsByBloodType } from './donorService.js';
import { getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.js';
import { calculateDistanceKm } from '../utils/geoUtils.js';
import { sanitizeDonorForMatch } from '../models/entities.js';

export const findMatchesForRequest = async (requestId, radiusKm = 50) => {
  const request = await getBloodRequestById(requestId);
  const compatibleTypes = getCompatibleDonorBloodTypes(request.bloodType);

  if (compatibleTypes.length === 0) {
    return {
      requestId: request.requestId,
      requestedBloodType: request.bloodType,
      hospitalName: request.hospitalName,
      city: request.city,
      totalCompatibleDonorsFound: 0,
      searchRadiusKm: radiusKm,
      matches: []
    };
  }

  // Fetch available donors for all compatible blood groups concurrently
  const donorQueries = compatibleTypes.map((bType) =>
    getAvailableDonorsByBloodType(bType)
  );
  const results = await Promise.all(donorQueries);
  const allDonors = results.flat();

  const reqLat = request.location?.latitude;
  const reqLon = request.location?.longitude;

  const matchedDonors = [];

  for (const donor of allDonors) {
    // Skip if donor is marked not available
    if (!donor.isAvailable) continue;

    let distanceKm = null;
    const donorLat = donor.location?.latitude;
    const donorLon = donor.location?.longitude;

    if (
      reqLat != null && reqLon != null &&
      donorLat != null && donorLon != null &&
      !(reqLat === 0 && reqLon === 0 && donorLat === 0 && donorLon === 0)
    ) {
      distanceKm = calculateDistanceKm(reqLat, reqLon, donorLat, donorLon);

      // Filter out donors beyond search radius
      if (radiusKm && distanceKm > radiusKm) {
        continue;
      }
    }

    // Exact match score
    const isExactMatch = donor.bloodType === request.bloodType;
    const distancePenalty = distanceKm != null ? Math.min(distanceKm, 50) : 0;
    const matchScore = Math.max(10, Math.round((isExactMatch ? 100 : 70) - distancePenalty));

    // Privacy-safe donor representation (no raw email, masked/safe name)
    matchedDonors.push(
      sanitizeDonorForMatch(donor, distanceKm, isExactMatch, matchScore)
    );
  }

  // Sort by highest match score, then closest distance
  matchedDonors.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
  });

  return {
    requestId: request.requestId,
    requestedBloodType: request.bloodType,
    hospitalName: request.hospitalName,
    city: request.city,
    totalCompatibleDonorsFound: matchedDonors.length,
    searchRadiusKm: radiusKm,
    matches: matchedDonors
  };
};
