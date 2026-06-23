const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register({
    email: req.validated.body.email,
    password: req.validated.body.password,
    role: req.validated.body.role,
    displayName: req.validated.body.displayName
  });

  return sendCreated(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    email: req.validated.body.email,
    password: req.validated.body.password
  });

  return sendSuccess(res, result);
});

const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  return sendSuccess(res, result);
});

const syncProfile = asyncHandler(async (req, res) => {
  const result = await authService.syncProfile(req.user.id, {
    role: req.validated?.body?.role
  });

  return sendSuccess(res, result);
});

module.exports = { register, login, getMe, syncProfile };
