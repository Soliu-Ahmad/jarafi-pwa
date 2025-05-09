const express = require("express");
const { setPIN, retrievePin } = require("../handler/pinHandler");
const Pin = require("../model/pin");
const router = express.Router();

router.post("/set-pin", setPIN);
router.post("/get-pin", retrievePin);

router.get("/exists/:wallet", async (req, res) => {
  const pinExists = await Pin.exists({ wallet: req.params.wallet });
  res.json({ exists: !!pinExists });
});

module.exports = router;
