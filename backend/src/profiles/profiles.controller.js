const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const authRepository = require('../auth/auth.repository');
const AppError = require('../shared/utils/appError');
const { supabaseAdmin } = require('../config/supabase');

const getOrganizerProfile = asyncHandler(async (req, res) => {
  const profile = await authRepository.findOrganizerProfile(req.user.id);
  if (!profile) {
    return sendSuccess(res, {
      organizationName: '',
      organizationType: '',
      phone: '',
      address: ''
    });
  }
  return sendSuccess(res, {
    organizationName: profile.organization_name,
    organizationType: profile.organization_type || '',
    phone: profile.contact_number,
    address: profile.business_address
  });
});

const updateOrganizerProfile = asyncHandler(async (req, res) => {
  const { organizationName, phone, address, organizationType } = req.body;
  const profile = await authRepository.upsertOrganizerProfile(
    req.user.id,
    organizationName,
    phone || null,
    address || null,
    organizationType || null
  );

  return sendSuccess(res, {
    organizationName: profile.organization_name,
    organizationType: profile.organization_type || '',
    phone: profile.contact_number,
    address: profile.business_address
  });
});

const getAdminSettings = asyncHandler(async (req, res) => {
  const profile = await authRepository.findByUserId(req.user.id);
  if (!profile) {
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }
  return sendSuccess(res, {
    displayName: profile.display_name || '',
    email: profile.email
  });
});

const updateAdminSettings = asyncHandler(async (req, res) => {
  const { displayName } = req.body;
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ display_name: displayName })
    .eq('id', req.user.id)
    .select('*')
    .single();

  if (error) throw error;
  return sendSuccess(res, {
    displayName: data.display_name || '',
    email: data.email
  });
});

module.exports = {
  getOrganizerProfile,
  updateOrganizerProfile,
  getAdminSettings,
  updateAdminSettings
};
