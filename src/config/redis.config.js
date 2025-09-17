import { createClient } from "redis";

// Cấu hình Redis với các tùy chọn nâng cao
const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 10000, // 10 giây
    lazyConnect: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis: Too many reconnection attempts, giving up");
        return new Error("Too many reconnection attempts");
      }
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, ...
      return Math.min(retries * 100, 3000);
    },
  },
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

const clientRedis = createClient(redisConfig);

// Event handlers
clientRedis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

clientRedis.on("connect", () => {
  console.log("Redis: Connecting...");
});

clientRedis.on("ready", () => {
  console.log("Redis: Connected and ready");
});

clientRedis.on("reconnecting", () => {
  console.log("Redis: Reconnecting...");
});

clientRedis.on("end", () => {
  console.log("Redis: Connection ended");
});

// Function để kết nối Redis
const connect = async () => {
  try {
    if (!clientRedis.isOpen) {
      await clientRedis.connect();
      console.log("Redis: Successfully connected");
    }
  } catch (error) {
    console.error("Redis: Connection failed:", error);
    // Retry connection sau 5 giây
    setTimeout(connect, 5000);
  }
};

// Function để kiểm tra kết nối
const isConnected = () => {
  return clientRedis.isOpen;
};

// Function để đóng kết nối
const disconnect = async () => {
  try {
    if (clientRedis.isOpen) {
      await clientRedis.disconnect();
      console.log("Redis: Disconnected");
    }
  } catch (error) {
    console.error("Redis: Disconnect error:", error);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Redis: Graceful shutdown...");
  await disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Redis: Graceful shutdown...");
  await disconnect();
  process.exit(0);
});

// Tự động kết nối khi import
connect();

export default clientRedis;
export { connect, disconnect, isConnected };
