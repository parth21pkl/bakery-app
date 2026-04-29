const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare(
      "SELECT id, full_name, username, role FROM users WHERE username = ? AND password = ? AND is_active = 1"
    )
    .get(username, password);

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json(user);
});

module.exports = router;