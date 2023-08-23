import express from "express";
import morgan from "morgan";

import { engine } from "express-handlebars";

import "dotenv/config";

import path from "path";
import route from "./routes/v1";
import { connect } from "./config/mongodb";

const app = express();

// DB connection

connect().catch(console.log);

// PARSE JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOGGER HTTP
app.use(morgan("combined"));

// CUSTOM PREFIX
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));

// ROUTER
route(app);

app.listen(process.env.APP_PORT || 3001, process.env.APP_HOST, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Hello Thuyet Lam Dev, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`
  );
});
