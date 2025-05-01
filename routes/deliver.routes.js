const router = require("express").Router()
const {
  createDeliver,
  getAllDelivers,
  getDeliverById,
  updateDeliver,
  deleteDeliver,
} = require("../controllers/deliver.controller")

router.post("/", createDeliver);
router.get("/", getAllDelivers);
router.get("/:id", getDeliverById);
router.put("/:id", updateDeliver);
router.delete("/:id", deleteDeliver);

module.exports = router;
