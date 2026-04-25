const Notification = require("../models/Notification");

async function createNotification({ userId, type, message, avatar = "", link = "/" }) {
  try {
    await Notification.create({ userId, type, message, avatar, link });
  } catch (_) { /* non-blocking — never crash the caller */ }
}

async function createBulkNotifications(userIds, { type, message, link = "/" }) {
  if (!userIds?.length) return;
  try {
    await Notification.insertMany(
      userIds.map((userId) => ({ userId, type, message, link })),
      { ordered: false }
    );
  } catch (_) {}
}

module.exports = { createNotification, createBulkNotifications };
