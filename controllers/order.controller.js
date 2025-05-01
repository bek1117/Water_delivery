const db = require("../config/db");
const Joi = require("joi");

const orderSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  deliver_id: Joi.number().integer().positive().required(),
  water_count: Joi.number().integer().positive().required(),
  total_price: Joi.number().precision(2).positive().required(),
  date: Joi.date().required(),
  promised_time: Joi.number().integer().required(),
  status: Joi.string()
    .valid("pending", "confirmed", "delivered", "cancelled")
    .required(),
});

const createOrder = (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const {
    user_id,
    deliver_id,
    water_count,
    total_price,
    date,
    promised_time,
    status,
  } = value;
  const sql = `
    INSERT INTO order (user_id, deliver_id, water_count, total_price, date, promised_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      user_id,
      deliver_id,
      water_count,
      total_price,
      date,
      promised_time,
      status,
    ],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res
        .status(201)
        .send({
          status: "success",
          message: "Order created",
          id: result.insertId,
        });
    }
  );
};

const getAllOrders = (req, res) => {
  const {
    limit = 10,
    offset = 1,
    search = "",
    sortBy = "id",
    order = "ASC",
  } = req.query;
  const sql = `
    SELECT * FROM order
    WHERE status LIKE ?
    ORDER BY ${sortBy} ${order.toUpperCase() === "DESC" ? "DESC" : "ASC"}
    LIMIT ? OFFSET ?
  `;
  db.query(
    sql,
    [`%${search}%`, parseInt(limit), (parseInt(offset) - 1) * parseInt(limit)],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(200).send({ status: "success", data: result });
    }
  );
};

const getOrderById = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("SELECT * FROM `order` WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Order not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const updateOrder = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  const { error, value } = orderSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const {
    user_id,
    deliver_id,
    water_count,
    total_price,
    date,
    promised_time,
    status,
  } = value;
  const sql = `
    UPDATE order
    SET user_id=?, deliver_id=?, water_count=?, total_price=?, date=?, promised_time=?, status=?
    WHERE id=?
  `;
  db.query(
    sql,
    [
      user_id,
      deliver_id,
      water_count,
      total_price,
      date,
      promised_time,
      status,
      id,
    ],
    (err) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(200).send({ status: "success", message: "Order updated" });
    }
  );
};

const deleteOrder = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("DELETE FROM `order` WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Order not found" });
    res.status(200).send({ status: "success", message: "Order deleted" });
  });
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
