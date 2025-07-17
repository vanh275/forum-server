const express = require('express');
const router = express.Router();
const { createTopic, getTopicsForPreviewSection, getTopicsList, updateTopic, deleteTopic } = require('../controllers/topic-controller')

router.post('/topics', createTopic)
router.get('/topics/preview-section', getTopicsForPreviewSection)
router.get('/topics', getTopicsList)
router.put('/topics/:topicId', updateTopic)
router.delete('/topics/:topicId', deleteTopic)

module.exports = router;
