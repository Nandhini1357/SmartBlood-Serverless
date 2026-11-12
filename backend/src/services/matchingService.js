/**
 * SmartBlood - Intelligent Matching Engine
 * Matches blood requests with compatible, nearby, and available donors.
 */
import { getBloodRequestById } from './requestService.js';
import { getAvailableDonorsByBloodType } from './donorService.js';
import { getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.js';
import { calculateDistanceKm } from '../utils/geoUtils.js';

export const findMatchesForRequest = async (requestId, radiusKm = 50) => {
  const request = await getBloodRequestById(requestId);
  const compatibleTypes = getCompatibleDonorBloodTypes(request.bloodType);

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
    let distanceKm = null;
    if (reqLat != null && reqLon != null && donor.location?.latitude != null && donor.location?.longitude != null) {
      distanceKm = calculateDistanceKm(
        reqLat,
        reqLon,
        donor.location.latitude,
        donor.location.longitude
      );

      // Filter by radius if coordinates exist
      if (distanceKm > radiusKm) {
        continue;
      }
    }

    // Exact match score (exact match gives higher match score than cross-compatible)
    const isExactMatch = donor.bloodType === request.bloodType;
    const matchScore = (isExactMatch ? 100 : 70) - (distanceKm ? Math.min(distanceKm, 50) : 0);

    matchedDonors.push({
      donorId: donor.donorId,
      name: donor.name,
      bloodType: donor.bloodType,
      phone: donor.phone,
      city: donor.city,
      distanceKm,
      isExactMatch,
      matchScore: Math.max(matchScore, 10),
      isAvailable: donor.isAvailable
    });
  }

  // Sort by highest match score, then closest distance
  matchedDonors.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (a.distanceKm || 9999) - (b.distanceKm || 9999);
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
