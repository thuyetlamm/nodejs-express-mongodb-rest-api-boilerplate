import customerRoute from "./customerRoute.js";

import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import bolRoute from "./bolRoute.js";

function route(app) {
  app.use("/api/v1", customerRoute);
  app.use("/api/v1", userRoute);
  app.use("/api/v1", authRoute);
  app.use("/api/v1", bolRoute);
}

export default route;
