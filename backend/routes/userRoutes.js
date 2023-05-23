const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controller/userController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();


///////////////////All User Routes//////////////////////////

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;

