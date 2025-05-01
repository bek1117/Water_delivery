const db = require("../config/db");
const Joi = require("joi");

const getAllUsers = (req, res) => {
  let { limit, offset, search, email, phone_number, sortBy, order } = req.query;
  limit = parseInt(limit) || 10;
  offset = parseInt(offset) || 1;

  const values = [];
  const conditions = [];

  if (search) {
    conditions.push(`(
      first_name LIKE ? OR 
      last_name LIKE ? OR 
      email LIKE ? OR 
      phone_number LIKE ?
    )`);
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword, keyword);
  }

  if (email) {
    conditions.push(`email = ?`);
    values.push(email);
  }

  if (phone_number) {
    conditions.push(`phone_number = ?`);
    values.push(phone_number);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const validSortFields = [
    "id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
  ];
  const validOrder = ["asc", "desc"];

  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  const sortDirection = validOrder.includes(order?.toLowerCase())
    ? order.toUpperCase()
    : "ASC";

  const sql = `
    SELECT * FROM user 
    ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;

  values.push(limit, (offset - 1) * limit);

  db.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    res.status(200).send({ status: "success", data: result });
  });
};


const getUserById = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.params);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: "ID must be a positive integer" });

  const { id } = req.params;
  db.query(`SELECT * FROM user WHERE id = ?`, [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const createUser = (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().max(255).required(),
    last_name: Joi.string().max(255).required(),
    phone_number: Joi.string()
      .pattern(/^\+998\d{9}$/)
      .required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(255).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const { first_name, last_name, phone_number, email, password } = value;
  const sql = `INSERT INTO user (first_name, last_name, phone_number, email, password) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [first_name, last_name, phone_number, email, password],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(201).send({
        status: "success",
        message: "User created",
        userId: result.insertId,
      });
    }
  );
};

const updateUser = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
    first_name: Joi.string().max(255),
    last_name: Joi.string().max(255),
    phone_number: Joi.string().pattern(/^\+998\d{9}$/),
    email: Joi.string().email().max(255),
    password: Joi.string().min(8).max(255),
  });

  const data = { ...req.body, id: parseInt(req.params.id) };
  const { error, value } = schema.validate(data);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const fields = Object.entries(value).filter(([key]) => key !== "id");
  if (fields.length === 0)
    return res
      .status(400)
      .send({ status: "error", message: "No fields to update" });

  const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
  const values = fields.map(([, val]) => val);

  db.query(
    `UPDATE user SET ${setClause} WHERE id = ?`,
    [...values, value.id],
    (err) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(200).send({ status: "success", message: "User updated" });
    }
  );
};

const deleteUser = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.params);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: "ID must be a positive integer" });

  const { id } = req.params;
  db.query(`DELETE FROM user WHERE id = ?`, [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    res.status(200).send({ status: "success", message: "User deleted" });
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
