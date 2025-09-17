import express from "express";

import cors from "cors";

import { engine } from "express-handlebars";

import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";
import route from "./routes/v1/index.js";
import { connect } from "./config/mongodb.js";
import { corsOptions } from "./config/cors.js";
import { connect as connectRedis, isConnected } from "./config/redis.config.js";
import redisService from "./services/redisService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// DB connections
connect().catch(console.log);

// Redis connection
connectRedis().catch(console.log);

// CONFIG CORS

app.use(cors());

// PARSE JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOGGER HTTP
// app.use(morgan("combined"));

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

// Health check endpoint
app.get("/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: "Connected", // MongoDB connection status
      redis: isConnected() ? "Connected" : "Disconnected",
    },
  };

  res.json(health);
});

// Redis status endpoint
app.get("/redis/status", async (req, res) => {
  try {
    const isRedisConnected = await redisService.ping();
    const info = await redisService.getInfo();

    res.json({
      connected: isRedisConnected,
      info: info ? info.split("\r\n").slice(0, 10) : null, // Chỉ lấy 10 dòng đầu
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(process.env.APP_PORT || 3001, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Hello Thuyet Lam Dev, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`
  );
  console.log(
    `Health check: http://${process.env.APP_HOST}:${process.env.APP_PORT}/health`
  );
  console.log(
    `Redis status: http://${process.env.APP_HOST}:${process.env.APP_PORT}/redis/status`
  );
});
