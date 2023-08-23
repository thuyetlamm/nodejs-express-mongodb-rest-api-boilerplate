const customerRoute = require("./customerRoute");
const userRoute = require("./userRoute");

function route(app) {
  app.use("/api/v1", customerRoute);
  app.use("/api/v1", userRoute);
}

module.exports = route;
