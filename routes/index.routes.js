const userRoute = require("./user.routes");
const adressRoute = require("./adress.routes");
const orderRoute = require("./order.routes")
const deliverRoute = require("./deliver.routes")
const indexRoute = require("express").Router();

indexRoute.use("/users", userRoute);
indexRoute.use("/adress", adressRoute)
indexRoute.use("/order", orderRoute)
indexRoute.use("/deliver", deliverRoute)


module.exports = indexRoute;
