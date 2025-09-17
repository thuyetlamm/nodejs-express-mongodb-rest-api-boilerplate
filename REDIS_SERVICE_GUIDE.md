# Redis Service Guide

Hướng dẫn sử dụng Redis Service trong dự án Node.js Express MongoDB REST API Boilerplate.

## 📋 Mục lục

- [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
- [Các chức năng cơ bản](#các-chức-năng-cơ-bản)
- [Caching](#caching)
- [Session Management](#session-management)
- [Pub/Sub](#pubsub)
- [Middleware](#middleware)
- [Rate Limiting](#rate-limiting)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [API Endpoints](#api-endpoints)

## 🚀 Cài đặt và cấu hình

### 1. Cài đặt Redis Server

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS với Homebrew
brew install redis

# Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
# Hoặc với password: redis://:password@localhost:6379
# Hoặc với database: redis://localhost:6379/1
```

### 3. Khởi động Redis

```bash
# Khởi động Redis server
redis-server

# Hoặc với Docker
docker start redis
```

## 🔧 Các chức năng cơ bản

### Import Redis Service

```javascript
import redisService from "./services/redisService.js";
```

### Lưu trữ dữ liệu

```javascript
// Lưu với TTL (Time To Live)
await redisService.set("user:123", { name: "John", age: 30 }, 3600); // 1 giờ

// Lưu không có TTL
await redisService.set("config:app_name", "My App");
```

### Lấy dữ liệu

```javascript
const user = await redisService.get("user:123");
console.log(user); // { name: "John", age: 30 }
```

### Kiểm tra tồn tại

```javascript
const exists = await redisService.exists("user:123");
console.log(exists); // true hoặc false
```

### Xóa dữ liệu

```javascript
await redisService.del("user:123");
```

### Lấy thời gian sống còn lại

```javascript
const ttl = await redisService.ttl("user:123");
console.log(ttl); // Số giây còn lại, -1 nếu không có TTL, -2 nếu không tồn tại
```

## 💾 Caching

### Cache với Fallback Function

```javascript
// Lấy dữ liệu từ cache hoặc database
const products = await redisService.cache(
  "products:all", // Cache key
  async () => {
    // Fallback function (gọi database)
    return await Product.find();
  },
  300 // TTL: 5 phút
);
```

### Invalidate Cache

```javascript
// Xóa cache theo pattern
await redisService.invalidateCache("products:*");

// Xóa cache cụ thể
await redisService.del("products:all");
```

## 👤 Session Management

### Lưu Session

```javascript
const sessionId = "sess_" + Math.random().toString(36);
const sessionData = {
  userId: 123,
  username: "john_doe",
  loginTime: new Date().toISOString(),
};

await redisService.setSession(sessionId, sessionData, 1800); // 30 phút
```

### Lấy Session

```javascript
const session = await redisService.getSession(sessionId);
if (session) {
  console.log("User logged in:", session.username);
}
```

### Xóa Session

```javascript
await redisService.deleteSession(sessionId);
```

## 📡 Pub/Sub

### Publish Message

```javascript
await redisService.publish("notifications", {
  type: "order_update",
  message: "Đơn hàng #12345 đã được xử lý",
  orderId: 12345,
});
```

### Subscribe Channel

```javascript
const subscriber = await redisService.subscribe("notifications", (message) => {
  console.log("Nhận được notification:", message);
});

// Unsubscribe khi không cần
await subscriber.unsubscribe("notifications");
await subscriber.disconnect();
```

## 🛡️ Middleware

### Cache Middleware

```javascript
import { cacheMiddleware } from "./middlewares/redisCache.js";

// Cache tất cả GET requests trong 1 giờ
app.use("/api/products", cacheMiddleware({ ttl: 3600 }));

// Cache với custom key generator
app.use(
  "/api/users",
  cacheMiddleware({
    ttl: 1800,
    keyGenerator: (req) => `user:${req.params.id}`,
    skipCache: (req) => req.method !== "GET",
  })
);
```

### Invalidate Cache Middleware

```javascript
import { invalidateCacheMiddleware } from "./middlewares/redisCache.js";

// Invalidate cache khi có thay đổi dữ liệu
app.post(
  "/api/products",
  invalidateCacheMiddleware("products:*"),
  createProduct
);
```

### User Cache Middleware

```javascript
import { userCacheMiddleware } from "./middlewares/redisCache.js";

// Cache dữ liệu theo user
app.use("/api/profile", userCacheMiddleware({ ttl: 900 }));
```

### Rate Limiting Middleware

```javascript
import { redisRateLimitMiddleware } from "./middlewares/redisCache.js";

// Giới hạn 100 requests trong 15 phút
app.use(
  "/api/",
  redisRateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 phút
    maxRequests: 100,
  })
);
```

## ⚡ Rate Limiting

### Sử dụng trong Controller

```javascript
import redisService from "../services/redisService.js";

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const rateLimitKey = `rate_limit:order:${userId}`;

  // Kiểm tra rate limit
  const currentRequests = (await redisService.get(rateLimitKey)) || 0;

  if (currentRequests >= 5) {
    // Tối đa 5 orders/phút
    return res.status(429).json({
      error: "Too Many Orders",
      message: "Bạn chỉ có thể tạo tối đa 5 đơn hàng mỗi phút",
    });
  }

  // Tăng counter
  await redisService.set(rateLimitKey, currentRequests + 1, 60);

  // Xử lý tạo order...
  res.json({ message: "Order created successfully" });
};
```

## 📊 Bulk Operations

### Lưu nhiều khóa

```javascript
const bulkData = {
  "config:app_name": "My App",
  "config:version": "1.0.0",
  "stats:users": 1500,
  "stats:orders": 500,
};

await redisService.mset(bulkData, 3600);
```

### Lấy nhiều khóa

```javascript
const keys = ["config:app_name", "config:version", "stats:users"];
const data = await redisService.mget(keys);
console.log(data); // { "config:app_name": "My App", ... }
```

### Tìm kiếm theo pattern

```javascript
const configKeys = await redisService.keys("config:*");
console.log(configKeys); // ["config:app_name", "config:version"]
```

### Xóa theo pattern

```javascript
const deletedCount = await redisService.delPattern("temp:*");
console.log(`Đã xóa ${deletedCount} keys`);
```

## 🔍 Ví dụ sử dụng

### Trong Controller

```javascript
import redisService from "../services/redisService.js";

export const getProducts = async (req, res) => {
  try {
    // Thử lấy từ cache trước
    const cacheKey = `products:page:${req.query.page || 1}`;
    let products = await redisService.get(cacheKey);

    if (!products) {
      // Cache miss - lấy từ database
      products = await Product.find()
        .limit(10)
        .skip((req.query.page - 1) * 10);

      // Lưu vào cache
      await redisService.set(cacheKey, products, 300); // 5 phút
    }

    res.json({
      data: products,
      cached: products ? true : false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Invalidate cache
    await redisService.invalidateCache("products:*");

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Trong Service

```javascript
import redisService from "../services/redisService.js";

export class UserService {
  static async getUserById(userId) {
    const cacheKey = `user:${userId}`;

    return await redisService.cache(
      cacheKey,
      async () => {
        return await User.findById(userId);
      },
      1800
    ); // Cache 30 phút
  }

  static async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Cập nhật cache
    await redisService.set(`user:${userId}`, user, 1800);

    return user;
  }

  static async deleteUser(userId) {
    await User.findByIdAndDelete(userId);

    // Xóa cache
    await redisService.del(`user:${userId}`);
  }
}
```

## 🌐 API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "mongodb": "Connected",
    "redis": "Connected"
  }
}
```

### Redis Status

```http
GET /redis/status
```

Response:

```json
{
  "connected": true,
  "info": [
    "# Server",
    "redis_version:7.0.0",
    "redis_git_sha1:00000000",
    "redis_git_dirty:0",
    "redis_build_id:1234567890abcdef",
    "redis_mode:standalone",
    "os:Darwin 20.6.0 x86_64",
    "arch_bits:64",
    "multiplexing_api:epoll"
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Error Handling

Redis Service có built-in error handling:

```javascript
// Tất cả methods đều trả về null/false khi có lỗi
const data = await redisService.get("key");
if (data === null) {
  // Có thể là lỗi hoặc key không tồn tại
  console.log("Không thể lấy dữ liệu từ Redis");
}

// Kiểm tra kết nối
const isConnected = await redisService.ping();
if (!isConnected) {
  console.log("Redis không kết nối được");
}
```

## 🔧 Cấu hình nâng cao

### Redis Config Options

```javascript
// Trong redis.config.js
const redisConfig = {
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Too many retries");
      return Math.min(retries * 100, 3000);
    },
  },
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
};
```

### Environment Variables

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# App Configuration
APP_HOST=localhost
APP_PORT=3001
```

## 📝 Best Practices

1. **Sử dụng TTL phù hợp**: Không cache quá lâu, cập nhật khi cần
2. **Key naming convention**: Sử dụng prefix rõ ràng (user:, product:, config:)
3. **Error handling**: Luôn xử lý lỗi Redis gracefully
4. **Memory management**: Không cache dữ liệu quá lớn
5. **Monitoring**: Theo dõi Redis memory usage và performance
6. **Fallback strategy**: Luôn có fallback khi Redis fail

## 🧪 Testing

Chạy ví dụ để test Redis service:

```bash
# Chạy file ví dụ
node src/examples/redisExample.js

# Hoặc import trong code
import { runAllExamples } from "./examples/redisExample.js";
await runAllExamples();
```

## 📚 Tài liệu tham khảo

- [Redis Documentation](https://redis.io/docs/)
- [Node.js Redis Client](https://github.com/redis/node-redis)
- [Redis Commands](https://redis.io/commands/)

---

**Lưu ý**: Đảm bảo Redis server đang chạy trước khi sử dụng các chức năng này.
