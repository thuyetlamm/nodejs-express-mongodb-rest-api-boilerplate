const customerRoute = require("./customerRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const bolRoute = require("./bolRoute");
const wishRoute = require("./wishRoute");
const confirmRoute = require("./confirmRoute");

function route(app) {
  app.use("/api/v1", customerRoute);
  app.use("/api/v1", userRoute);
  app.use("/api/v1", authRoute);
  app.use("/api/v1", bolRoute);
  app.use("/api/v1", wishRoute);
  app.use("/api/v1", confirmRoute);
}

module.exports = route;
