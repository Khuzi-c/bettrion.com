const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const ticketController = require('../controllers/ticketController');
const adminController = require('../controllers/adminController');

// Public Platforms
router.get('/platforms', contentController.getPlatforms);
router.get('/platforms/:id', contentController.getPlatformById);
router.get('/platforms/slug/:slug', contentController.getPlatformBySlug);

// Admin Platforms
router.post('/platforms', contentController.createPlatform);
router.get('/admin/platforms', contentController.getAllPlatformsAdmin);
router.put('/platforms/:id', contentController.updatePlatform);
router.delete('/platforms/:id', contentController.deletePlatform);

// Admin Articles
router.get('/articles', contentController.getArticles);
router.get('/articles/:id', contentController.getArticleById);
router.post('/articles', contentController.createArticle);
router.delete('/articles/:id', contentController.deleteArticle);

// Tickets
router.post('/tickets/create', ticketController.createTicket);
router.get('/tickets', ticketController.getAllTickets);
router.get('/tickets/:id/messages', ticketController.getTicketMessages);
router.post('/tickets/close', ticketController.closeTicket);
router.post('/messages', ticketController.sendMessage);
router.put('/tickets/:id/status', ticketController.updateTicketStatus);
router.delete('/tickets/:id', ticketController.deleteTicket);

// Admin
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.getUsers);
router.get('/admin/analytics', adminController.getAnalytics);
router.post('/admin/track', adminController.trackVisit);

// Staff
const staffController = require('../controllers/staffController');
router.post('/staff/clock-in', staffController.clockIn);
router.post('/staff/clock-out', staffController.clockOut);
router.get('/staff/status/:user_id', staffController.getStaffStatus);
router.get('/admin/staff-logs', staffController.getAllLogs);

// Backups
const backupController = require('../controllers/backupController');
router.post('/backups/create', backupController.createBackup);
router.get('/backups', backupController.getAllBackups);
router.get('/backups/:id', backupController.getBackupById);
router.post('/backups/:id/restore', backupController.restoreFromBackup);
router.delete('/backups/:id', backupController.deleteBackup);

// Activity Logs & Analytics
const activityLogController = require('../controllers/activityLogController');
router.get('/activity-logs', activityLogController.getActivityLogs);
router.post('/track-button', activityLogController.trackButtonClick);
router.get('/button-stats', activityLogController.getButtonStats);

// Uploads
const uploadController = require('../controllers/uploadController');
router.post('/uploads', uploadController.uploadMiddleware, uploadController.handleUpload);
router.get('/uploads/list', uploadController.getAllImages);
router.delete('/uploads/:id', uploadController.deleteImage);

// Announcements
const announcementController = require('../controllers/announcementController');
router.get('/announcements/active', announcementController.getActiveAnnouncements);
router.get('/admin/announcements', announcementController.getAllAnnouncements);
router.post('/admin/announcements', announcementController.createAnnouncement);
router.put('/admin/announcements/:id', announcementController.updateAnnouncement);
router.delete('/admin/announcements/:id', announcementController.deleteAnnouncement);
router.patch('/admin/announcements/:id/toggle', announcementController.toggleAnnouncement);

// News RSS Feed
const newsController = require('../controllers/newsController');
router.get('/news/rss', newsController.getNewsFromRSS);
router.post('/admin/news/refresh', newsController.refreshNewsCache);

// Settings
const settingsController = require('../controllers/settingsController');
router.get('/settings/:key', settingsController.getSetting);
router.get('/admin/settings/all', settingsController.getAllSettings);
router.put('/admin/settings/:key', settingsController.updateSetting);
router.post('/admin/settings/maintenance/toggle', settingsController.toggleMaintenanceMode);

module.exports = router;
