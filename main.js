const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const routes = require("./routes/index.routes")

const PORT = process.env.PORT || 3333;

const app = express();
app.use(morgan("short"));
app.use(express.json())

app.use("/api", routes)

app.listen(PORT, () => {
  console.log(`Server started at: http://localhost:${PORT}`);
});
