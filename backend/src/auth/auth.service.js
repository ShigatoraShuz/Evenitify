const { supabase, supabaseAdmin } = require('../config/supabase');
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

  const profile = await authRepository.createProfile(
    authData.user.id,
    email,
    role,
    displayName
  );

  if (role === 'organizer') {
    await authRepository.upsertOrganizerProfile(
      authData.user.id,
      displayName || `${email.split('@')[0]} Organization`,
      null,
      null
    );
  }

  if (role === 'vendor') {
    await authRepository.upsertVendorProfile(
      authData.user.id,
      displayName || `${email.split('@')[0]} Business`,
      null,
      null
    );
  }

  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email
  });

  return { user: authData.user, profile };
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

  if (!profile) {
    await authRepository.createProfile(
      data.user.id,
      data.user.email,
      'organizer',
      null
    );
  }

  const fullProfile = profile || await authRepository.findByUserId(data.user.id);

  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: fullProfile?.role || 'organizer'
    }
  };
}

async function getMe(userId) {
  const profile = await authRepository.findByUserId(userId);

  if (!profile) {
    throw new AppError('User profile not found', 404, 'PROFILE_NOT_FOUND');
  }

  let organizerProfile = null;
  let vendorProfile = null;

  if (profile.role === 'organizer') {
    const { data } = await supabase
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    organizerProfile = data;
  }

  if (profile.role === 'vendor') {
    const { data } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    vendorProfile = data;
  }

  return {
    ...profile,
    organizerProfile,
    vendorProfile
  };
}

async function syncProfile(userId, { role }) {
  const existing = await authRepository.findByUserId(userId);

  if (existing) {
    if (role && role !== existing.role) {
      return authRepository.updateRole(userId, role);
    }
    return existing;
  }

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (!userData?.user) {
    throw new AppError('Supabase user not found', 404, 'USER_NOT_FOUND');
  }

  const newRole = role || 'organizer';
  return authRepository.createProfile(userId, userData.user.email, newRole, null);
}

module.exports = { register, login, getMe, syncProfile };
