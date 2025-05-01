const db = require("../config/db");
const Joi = require("joi");

const phoneSchema = Joi.object({
  adress_id: Joi.number().integer().positive().required(),
  number: Joi.number().integer().required(),
  owner_name: Joi.string().max(255).required(),
});

const createPhone = (req, res) => {
  const { error, value } = phoneSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const { adress_id, number, owner_name } = value;
  const sql = `INSERT INTO phone (adress_id, number, owner_name) VALUES (?, ?, ?)`;
  db.query(sql, [adress_id, number, owner_name], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    res
      .status(201)
      .send({
        status: "success",
        message: "Phone created",
        id: result.insertId,
      });
  });
};

const getAllPhones = (req, res) => {
  const {
    limit = 10,
    offset = 1,
    search = "",
    sortBy = "id",
    order = "ASC",
  } = req.query;
  const sql = `
    SELECT * FROM phone
    WHERE owner_name LIKE ?
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

const getPhoneById = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("SELECT * FROM phone WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Phone not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const updatePhone = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  const { error, value } = phoneSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const { adress_id, number, owner_name } = value;
  const sql = `
    UPDATE phone SET adress_id = ?, number = ?, owner_name = ? WHERE id = ?
  `;
  db.query(sql, [adress_id, number, owner_name, id], (err) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    res.status(200).send({ status: "success", message: "Phone updated" });
  });
};

const deletePhone = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  db.query("DELETE FROM phone WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Phone not found" });
    res.status(200).send({ status: "success", message: "Phone deleted" });
  });
};

module.exports = {
  createPhone,
  getAllPhones,
  getPhoneById,
  updatePhone,
  deletePhone,
};
