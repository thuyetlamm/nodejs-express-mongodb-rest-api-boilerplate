const customerRoute = require("./customerRoute");

function route(app) {
  app.use("/api/v1", customerRoute);
}

module.exports = route;
