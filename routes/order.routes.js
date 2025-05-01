const { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, getUserByspecificDates, getUserOrdersByNameLast6Months } = require("../controllers/order.controller");

const router = require("express").Router()

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/users", getUserByspecificDates);
router.get("/dates", getUserOrdersByNameLast6Months);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;