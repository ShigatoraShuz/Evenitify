const { supabase, supabaseAdmin } = require('../../config/supabase');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, role, display_name')
    .eq('id', data.user.id)
    .maybeSingle();

  const { data: organizerProfile } = await supabaseAdmin
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const { data: vendorProfile } = await supabaseAdmin
    .from('vendor_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const roles = profile?.role === 'admin'
    ? ['admin']
    : [
      organizerProfile ? 'organizer' : null,
      vendorProfile ? 'vendor' : null,
      !organizerProfile && !vendorProfile && profile?.role ? profile.role : null
    ].filter(Boolean);

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: roles.includes(profile?.role) ? profile.role : roles[0] || null,
    selectedRole: profile?.role || null,
    roles,
    displayName: profile?.display_name || null
  };

  next();
});

module.exports = authenticate;
