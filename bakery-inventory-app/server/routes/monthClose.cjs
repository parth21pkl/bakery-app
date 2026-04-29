const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Month close GET test working" });
});

router.post("/close-month", (req, res) => {
  res.json({ message: "Month close POST working" });
});

module.exports = router;