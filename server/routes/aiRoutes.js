// const express = require('express');
// const router = express.Router();
// const protect = require('../middleware/authMiddleware');
// const aiController = require('../controllers/aiController');

// // Generate email route
// router.post('/generate-email', protect, aiController.generateEmail);
// router.get('/email-history', protect, aiController.getEmailHistory);

// module.exports = router;


const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');
const { generateEmail, getHistory } = require('../controllers/aiController');

router.post('/generate-email', protect, generateEmail);
router.get('/history', protect, getHistory);

module.exports = router;