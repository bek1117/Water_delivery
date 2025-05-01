const db = require("../config/db");
const Joi = require("joi");

const paymentSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  type: Joi.string().valid("cash", "card").required(),
  status: Joi.string().valid("pending", "completed", "failed").required(),
});

const createPayment = (req, res) => {
  const { error, value } = paymentSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const { order_id, type, status } = value;
  const sql = `INSERT INTO payment (order_id, type, status) VALUES (?, ?, ?)`;
  db.query(sql, [order_id, type, status], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    res
      .status(201)
      .send({
        status: "success",
        message: "Payment created",
        id: result.insertId,
      });
  });
};

const getAllPayments = (req, res) => {
  const {
    limit = 10,
    offset = 1,
    search = "",
    sortBy = "id",
    order = "ASC",
  } = req.query;
  const sql = `
    SELECT * FROM payment
    WHERE status LIKE ? OR type LIKE ?
    ORDER BY ${sortBy} ${order.toUpperCase() === "DESC" ? "DESC" : "ASC"}
    LIMIT ? OFFSET ?
  `;
  const q = `%${search}%`;
  db.query(
    sql,
    [q, q, parseInt(limit), (parseInt(offset) - 1) * parseInt(limit)],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(200).send({ status: "success", data: result });
    }
  );
};

const getPaymentById = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("SELECT * FROM payment WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Payment not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const updatePayment = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  const { error, value } = paymentSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const { order_id, type, status } = value;
  const sql = `UPDATE payment SET order_id = ?, type = ?, status = ? WHERE id = ?`;
  db.query(sql, [order_id, type, status, id], (err) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    res.status(200).send({ status: "success", message: "Payment updated" });
  });
};

const deletePayment = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("DELETE FROM payment WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Payment not found" });
    res.status(200).send({ status: "success", message: "Payment deleted" });
  });
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
