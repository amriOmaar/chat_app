const express = require('express')
const { loginUser, registerUser, getUsers } = require('../Controllers/UserController.js')

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get", getUsers);

module.exports = router