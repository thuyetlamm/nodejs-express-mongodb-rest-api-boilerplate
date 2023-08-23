const customerRoute = require("./customerRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");

function route(app) {
  app.use("/api/v1", customerRoute);
  app.use("/api/v1", userRoute);
  app.use("/api/v1", authRoute);
}

module.exports = route;
