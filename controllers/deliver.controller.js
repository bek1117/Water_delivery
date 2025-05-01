const db = require("../config/db");
const Joi = require("joi");

const deliverSchema = Joi.object({
  first_name: Joi.string().max(255).required(),
  last_name: Joi.string().max(255).required(),
  phone_number: Joi.string().max(255).required(),
  car_model: Joi.string().max(255).required(),
  current_location: Joi.string().max(255).required(),
});

const createDeliver = (req, res) => {
  const { error, value } = deliverSchema.validate(req.body);
  if (error) return res.status(400).send({ status: "error", message: error.details[0].message });

  const { first_name, last_name, phone_number, car_model, current_location } = value;
  const sql = `
    INSERT INTO deliver (first_name, last_name, phone_number, car_model, current_location)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [first_name, last_name, phone_number, car_model, current_location], (err, result) => {
    if (err) return res.status(500).send({ status: "error", message: err.message });
    res.status(201).send({ status: "success", message: "Deliver created", id: result.insertId });
  });
};

const getAllDelivers = (req, res) => {
  const { limit = 10, offset = 1, search = "", sortBy = "id", order = "ASC" } = req.query;
  const sql = `
    SELECT * FROM deliver
    WHERE first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR car_model LIKE ?
    ORDER BY ${sortBy} ${order.toUpperCase() === "DESC" ? "DESC" : "ASC"}
    LIMIT ? OFFSET ?
  `;
  const q = `%${search}%`;
  db.query(sql, [q, q, q, q, parseInt(limit), (parseInt(offset) - 1) * parseInt(limit)], (err, result) => {
    if (err) return res.status(500).send({ status: "error", message: err.message });
    res.status(200).send({ status: "success", data: result });
  });
};

const getDeliverById = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1) return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("SELECT * FROM deliver WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0) return res.status(404).send({ status: "error", message: "Deliver not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const updateDeliver = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1) return res.status(400).send({ status: "error", message: "Invalid ID" });

  const { error, value } = deliverSchema.validate(req.body);
  if (error) return res.status(400).send({ status: "error", message: error.details[0].message });

  const { first_name, last_name, phone_number, car_model, current_location } = value;
  const sql = `
    UPDATE deliver
    SET first_name=?, last_name=?, phone_number=?, car_model=?, current_location=?
    WHERE id=?
  `;
  db.query(sql, [first_name, last_name, phone_number, car_model, current_location, id], (err) => {
    if (err) return res.status(500).send({ status: "error", message: err.message });
    res.status(200).send({ status: "success", message: "Deliver updated" });
  });
};

const deleteDeliver = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1) return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("DELETE FROM deliver WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0) return res.status(404).send({ status: "error", message: "Deliver not found" });
    res.status(200).send({ status: "success", message: "Deliver deleted" });
  });
};

module.exports = {
  createDeliver,
  getAllDelivers,
  getDeliverById,
  updateDeliver,
  deleteDeliver,
};
