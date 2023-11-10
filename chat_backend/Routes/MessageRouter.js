const express = require('express')
const { getMessages, addMessage } = require('../Controllers/MessageController')

const router = express.Router();

router.post("/get", getMessages);
router.post("/add", addMessage);

module.exports = router