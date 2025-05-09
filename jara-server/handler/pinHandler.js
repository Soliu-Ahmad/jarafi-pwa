const asyncHandler = require("express-async-handler");
const Pin = require("../model/pin");
const bcrypt = require("bcryptjs");

const setPIN = asyncHandler(async (req, res) => {
  const { wallet, pin } = req.body;

  // Check if all fields are filled
  if (!wallet || !pin) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  // Check if PIN is a number and has 4 digits
  if (isNaN(pin) || pin.toString().length !== 4) {
    return res.status(400).json({ message: "PIN must be a 4-digit number" });
  }

  // Hash the PIN
  const salt = await bcrypt.genSalt(10);
  const hashedPin = await bcrypt.hash(pin.toString(), salt);

  const existingPin = await Pin.findOne({ wallet });
  if (existingPin) {
    return res
      .status(400)
      .json({ message: "PIN already exists for this wallet" });
  }

  // Create a new PIN
  const newPin = await Pin.create({ wallet, pin: hashedPin });

  if (newPin) {
    const { _id, wallet, pin } = newPin;

    // console.log({ newPin });

    res.status(201).json({
      _id,
      wallet,
      pin,
    });
  } else {
    res.status(400).json({ message: "Failed to create PIN" });
  }
});

const retrievePin = asyncHandler(async (req, res) => {
  try {
    const { wallet, pin } = req.body;

    const existingPin = await Pin.findOne({ wallet });

    // console.log({ existingPin });

    if (existingPin) {
      const isMatch = await bcrypt.compare(pin.toString(), existingPin.pin);
      // console.log({ isMatch });

      if (isMatch) {
        res.json(existingPin);
      } else {
        res.status(401).json({ message: "Incorrect PIN" });
      }
    } else {
      res.status(404).json({ message: "Pin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    // console.log({ error });
  }
});

module.exports = { setPIN, retrievePin };
