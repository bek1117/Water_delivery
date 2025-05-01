const { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } = require("../controllers/payment.controller");

const router = require("express").Router()

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
