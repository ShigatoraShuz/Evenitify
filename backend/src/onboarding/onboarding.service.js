const authRepository = require('../auth/auth.repository');
const authService = require('../auth/auth.service');

async function getStatus(userId) {
  const user = await authService.getMe(userId);
  const selectedRoles = user.selectedRole ? [user.selectedRole] : [];
  const requiredRoles = user.roles.length > 0 ? user.roles : selectedRoles;

  return {
    completed: user.setupComplete,
    role: user.role,
    selectedRole: user.selectedRole,
    roles: user.roles,
    requiredRoles,
    hasOrganizerProfile: user.hasOrganizerProfile,
    hasVendorProfile: user.hasVendorProfile
  };
}

async function complete(userId, payload) {
  if (payload.role === 'organizer') {
    await authRepository.upsertOrganizerProfile(
      userId,
      payload.organizationName,
      payload.phone || null,
      payload.address || null,
      payload.organizationType || null
    );
  }

  if (payload.role === 'vendor') {
    await authRepository.upsertVendorProfile(
      userId,
      payload.businessName,
      payload.phone || null,
      payload.serviceArea || null,
      payload.businessDescription || null
    );
  }

  return getStatus(userId);
}

module.exports = { getStatus, complete };
