const { supabase } = require('../../config/supabase');
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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, role, display_name')
    .eq('id', data.user.id)
    .single();

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: profile?.role || null,
    displayName: profile?.display_name || null
  };

  next();
});

module.exports = authenticate;
