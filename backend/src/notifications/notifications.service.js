const AppError = require('../shared/utils/appError');
const notificationRepository = require('./notifications.repository');

async function listNotifications(actor, query) {
  return notificationRepository.findByUserId(actor.id, query);
}

async function getUnreadCount(actor) {
  return notificationRepository.getUnreadCount(actor.id);
}

async function markAsRead(actor, notificationId) {
  const notification = await notificationRepository.findById(notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (notification.user_id !== actor.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  return notificationRepository.markAsRead(notificationId, actor.id);
}

async function markAllAsRead(actor) {
  return notificationRepository.markAllAsRead(actor.id);
}

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };
