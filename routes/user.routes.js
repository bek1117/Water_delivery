const router = require("express").Router()
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/users.controller");

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;