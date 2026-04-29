const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    totalPurchase: 0,
    totalProduction: 0,
    totalDispatch: 0,
    totalSales: 0,
    totalReturned: 0,
    totalWastage: 0,
    netAmount: 0,
    items: [],
  });
});

module.exports = router;