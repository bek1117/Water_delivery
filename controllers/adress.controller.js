const db = require("../config/db");
const Joi = require("joi");

const addressSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  region: Joi.string()
    .valid(
      "Tashkent",
      "Tashkent Region",
      "Samarkand",
      "Fergana",
      "Andijan",
      "Namangan",
      "Bukhara",
      "Navoi",
      "Karakalpakstan",
      "Kashkadarya",
      "Surkhandarya",
      "Sirdarya",
      "Jizzakh",
      "Khorezm"
    )
    .required(),
  street: Joi.string().max(255).required(),
  house_number: Joi.number().integer().required(),
  intercom_number: Joi.number().integer().required(),
  intercom_code: Joi.string().max(255).required(),
  home_num: Joi.number().integer().required(),
  location: Joi.string().max(255).required(),
});

const createAddress = (req, res) => {
  const { error, value } = addressSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const {
    user_id,
    region,
    street,
    house_number,
    intercom_number,
    intercom_code,
    home_num,
    location,
  } = value;

  const sql = `
    INSERT INTO adress (user_id, region, street, house_number, intercom_number, intercom_code, home_num, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      region,
      street,
      house_number,
      intercom_number,
      intercom_code,
      home_num,
      location,
    ],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(201).send({
        status: "success",
        message: "Address created",
        id: result.insertId,
      });
    }
  );
};

const getAllAddresses = (req, res) => {
  let { limit, offset, search, region, user_id, sortBy, order } = req.query;

  limit = parseInt(limit) || 10;
  offset = parseInt(offset) || 1;

  const values = [];
  const conditions = [];

  if (search) {
    conditions.push(`(street LIKE ? OR location LIKE ?)`);
    const keyword = `%${search}%`;
    values.push(keyword, keyword);
  }

  if (region) {
    conditions.push(`region = ?`);
    values.push(region);
  }

  if (user_id) {
    conditions.push(`user_id = ?`);
    values.push(user_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const validSortFields = [
    "id",
    "user_id",
    "region",
    "street",
    "location",
    "house_number",
  ];
  const validOrder = ["asc", "desc"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  const sortDirection = validOrder.includes(order?.toLowerCase())
    ? order.toUpperCase()
    : "ASC";

  const sql = `
    SELECT * FROM adress 
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

const getAddressById = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res
      .status(400)
      .send({ status: "error", message: "Invalid address ID" });

  db.query("SELECT * FROM adress WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.length === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Address not found" });
    res.status(200).send({ status: "success", data: result[0] });
  });
};

const updateAddress = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res
      .status(400)
      .send({ status: "error", message: "Invalid address ID" });

  const { error, value } = addressSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: "error", message: error.details[0].message });

  const {
    user_id,
    region,
    street,
    house_number,
    intercom_number,
    intercom_code,
    home_num,
    location,
  } = value;

  const sql = `
    UPDATE adress 
    SET user_id=?, region=?, street=?, house_number=?, intercom_number=?, intercom_code=?, home_num=?, location=? 
    WHERE id=?
  `;

  db.query(
    sql,
    [
      user_id,
      region,
      street,
      house_number,
      intercom_number,
      intercom_code,
      home_num,
      location,
      id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).send({ status: "error", message: err.message });
      res.status(200).send({ status: "success", message: "Address updated" });
    }
  );
};

const deleteAddress = (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1)
    return res
      .status(400)
      .send({ status: "error", message: "Invalid address ID" });

  db.query("DELETE FROM adress WHERE id = ?", [id], (err, result) => {
    if (err)
      return res.status(500).send({ status: "error", message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .send({ status: "error", message: "Address not found" });
    res.status(200).send({ status: "success", message: "Address deleted" });
  });
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
