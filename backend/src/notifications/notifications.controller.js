const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const notificationService = require('./notifications.service');

const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user, req.validated.query);
  return sendSuccess(res, result.data, { total: result.total });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user);
  return sendSuccess(res, { count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user, req.validated.params.notificationId);
  return sendSuccess(res, notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user);
  return sendSuccess(res, { message: 'All notifications marked as read' });
});

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };
