const { supabaseAdmin } = require('../config/supabase');
const AppError = require('../shared/utils/appError');
const authRepository = require('./auth.repository');

async function register({ email, password, role, displayName }) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    throw new AppError(authError.message, 400, 'AUTH_REGISTER_FAILED');
  }

  const profile = role
    ? await authRepository.createProfile(authData.user.id, email, role, displayName)
    : null;

  return { user: authData.user, profile };
}

function buildRoles(profile, organizerProfile, vendorProfile) {
  if (profile?.role === 'admin') return ['admin'];
  const roles = [];
  if (organizerProfile) roles.push('organizer');
  if (vendorProfile) roles.push('vendor');
  if (roles.length === 0 && profile?.role) roles.push(profile.role);
  return roles;
}

function buildUserResponse(authUser, profile, organizerProfile, vendorProfile) {
  const roles = buildRoles(profile, organizerProfile, vendorProfile);
  const selectedRole = profile?.role || null;
  const activeRole = roles.includes(selectedRole) ? selectedRole : roles[0] || null;

  return {
    id: authUser.id,
    email: authUser.email,
    role: activeRole,
    selectedRole,
    roles,
    display_name: profile?.display_name || null,
    organizerProfile,
    vendorProfile,
    hasOrganizerProfile: !!organizerProfile,
    hasVendorProfile: !!vendorProfile,
    setupComplete: roles.length > 0 && (roles.includes('admin') || roles.every((role) => (
      role === 'organizer' ? !!organizerProfile : role === 'vendor' ? !!vendorProfile : false
    )))
  };
}

async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new AppError('Invalid email or password', 401, 'AUTH_LOGIN_FAILED');
  }

  const profile = await authRepository.findByUserId(data.user.id);
  const organizerProfile = await authRepository.findOrganizerProfile(data.user.id);
  const vendorProfile = await authRepository.findVendorProfile(data.user.id);

  return {
    session: data.session,
    user: buildUserResponse(data.user, profile, organizerProfile, vendorProfile)
  };
}

async function getMe(userId) {
  const profile = await authRepository.findByUserId(userId);

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (!userData?.user) {
    throw new AppError('Supabase user not found', 404, 'USER_NOT_FOUND');
  }

  const organizerProfile = await authRepository.findOrganizerProfile(userId);
  const vendorProfile = await authRepository.findVendorProfile(userId);

  return buildUserResponse(userData.user, profile, organizerProfile, vendorProfile);
}

async function syncProfile(userId, { role }) {
  const existing = await authRepository.findByUserId(userId);

  if (existing) {
    if (role && role !== existing.role) {
      await authRepository.updateRole(userId, role);
      return getMe(userId);
    }
    return getMe(userId);
  }

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (!userData?.user) {
    throw new AppError('Supabase user not found', 404, 'USER_NOT_FOUND');
  }

  const newRole = role || 'organizer';
  await authRepository.createProfile(userId, userData.user.email, newRole, null);
  return getMe(userId);
}

module.exports = { register, login, getMe, syncProfile };
