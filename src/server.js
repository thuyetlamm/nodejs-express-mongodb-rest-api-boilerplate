import express from "express";

import morgan from "morgan";

import { engine } from "express-handlebars";
import { connect } from "./config/mongodb";

const path = require("path");

const route = require("./routes/v1");

const app = express();

const hostname = "localhost";
const port = 8017;

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

app.listen(port, hostname, () => {
  // eslint-disable-next-line no-console
  console.log(`Hello Thuyet Lam Dev, I am running at ${hostname}:${port}/`);
});
