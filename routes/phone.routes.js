const express = require("express").Router()
const { deletePhone, updatePhone, getPhoneById, getAllPhones, createPhone } = require("../controllers/phone.controller");

router.post("/", createPhone);
router.get("/", getAllPhones);
router.get("/:id", getPhoneById);
router.put("/:id", updatePhone);
router.delete("/:id", deletePhone);

module.exports = router;