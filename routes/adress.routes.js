const router = require("express").Router()

const {createAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress} = require('../controllers/adress.controller');

router.post("/", createAddress);
router.get("/", getAllAddresses);
router.get("/:id", getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;