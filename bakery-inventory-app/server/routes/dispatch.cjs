const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/locations", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM locations ORDER BY id").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  const { menu_item_id, location_id, quantity } = req.body;

  try {
    db.prepare(`
      INSERT INTO dispatch (menu_item_id, location_id, quantity)
      VALUES (?, ?, ?)
    `).run(menu_item_id, location_id, quantity);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;