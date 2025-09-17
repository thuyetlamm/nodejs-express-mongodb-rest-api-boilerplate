import redisService from "../services/redisService.js";

/**
 * Ví dụ sử dụng Redis Service
 * File này minh họa các cách sử dụng Redis service trong ứng dụng
 */

// ===== VÍ DỤ CÁC CHỨC NĂNG CƠ BẢN =====

async function basicOperationsExample() {
  console.log("=== VÍ DỤ CÁC CHỨC NĂNG CƠ BẢN ===");

  // Lưu dữ liệu
  const userData = {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "admin",
  };

  await redisService.set("user:1", userData, 3600); // TTL 1 giờ
  console.log("✅ Đã lưu user data");

  // Lấy dữ liệu
  const retrievedUser = await redisService.get("user:1");
  console.log("✅ Lấy user data:", retrievedUser);

  // Kiểm tra tồn tại
  const exists = await redisService.exists("user:1");
  console.log("✅ User exists:", exists);

  // Lấy TTL
  const ttl = await redisService.ttl("user:1");
  console.log("✅ TTL còn lại:", ttl, "giây");

  // Xóa dữ liệu
  await redisService.del("user:1");
  console.log("✅ Đã xóa user data");
}

// ===== VÍ DỤ CACHING =====

async function cachingExample() {
  console.log("\n=== VÍ DỤ CACHING ===");

  // Simulate expensive database query
  const expensiveQuery = async () => {
    console.log("🔄 Đang thực hiện query database...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2s delay
    return {
      products: [
        { id: 1, name: "iPhone 15", price: 25000000 },
        { id: 2, name: "Samsung Galaxy S24", price: 22000000 },
        { id: 3, name: "MacBook Pro", price: 45000000 },
      ],
      total: 3,
      timestamp: new Date().toISOString(),
    };
  };

  // Lần đầu: Cache miss, sẽ gọi expensiveQuery
  console.log("Lần 1 - Cache miss:");
  const start1 = Date.now();
  const result1 = await redisService.cache("products:all", expensiveQuery, 300); // Cache 5 phút
  const time1 = Date.now() - start1;
  console.log(`✅ Kết quả (${time1}ms):`, result1);

  // Lần thứ 2: Cache hit, lấy từ Redis
  console.log("\nLần 2 - Cache hit:");
  const start2 = Date.now();
  const result2 = await redisService.cache("products:all", expensiveQuery, 300);
  const time2 = Date.now() - start2;
  console.log(`✅ Kết quả (${time2}ms):`, result2);

  console.log(
    `🚀 Tốc độ cải thiện: ${Math.round(((time1 - time2) / time1) * 100)}%`
  );
}

// ===== VÍ DỤ SESSION MANAGEMENT =====

async function sessionExample() {
  console.log("\n=== VÍ DỤ SESSION MANAGEMENT ===");

  const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
  const sessionData = {
    userId: 123,
    username: "john_doe",
    loginTime: new Date().toISOString(),
    permissions: ["read", "write", "admin"],
    cart: {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
      total: 95000000,
    },
  };

  // Lưu session
  await redisService.setSession(sessionId, sessionData, 1800); // 30 phút
  console.log("✅ Đã tạo session:", sessionId);

  // Lấy session
  const retrievedSession = await redisService.getSession(sessionId);
  console.log("✅ Session data:", retrievedSession);

  // Cập nhật session
  retrievedSession.cart.items.push({ productId: 2, quantity: 1 });
  await redisService.setSession(sessionId, retrievedSession, 1800);
  console.log("✅ Đã cập nhật session");

  // Xóa session
  await redisService.deleteSession(sessionId);
  console.log("✅ Đã xóa session");
}

// ===== VÍ DỤ PUB/SUB =====

async function pubSubExample() {
  console.log("\n=== VÍ DỤ PUB/SUB ===");

  const channel = "notifications";

  // Subscribe
  const subscriber = await redisService.subscribe(channel, (message) => {
    console.log("📨 Nhận được notification:", message);
  });

  if (subscriber) {
    console.log("✅ Đã subscribe channel:", channel);

    // Publish messages
    setTimeout(async () => {
      await redisService.publish(channel, {
        type: "welcome",
        message: "Chào mừng bạn đến với hệ thống!",
        timestamp: new Date().toISOString(),
      });
    }, 1000);

    setTimeout(async () => {
      await redisService.publish(channel, {
        type: "order_update",
        message: "Đơn hàng #12345 đã được xử lý",
        orderId: 12345,
        status: "shipped",
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    // Unsubscribe sau 5 giây
    setTimeout(async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
      console.log("✅ Đã unsubscribe và disconnect");
    }, 5000);
  }
}

// ===== VÍ DỤ RATE LIMITING =====

async function rateLimitExample() {
  console.log("\n=== VÍ DỤ RATE LIMITING ===");

  const userIp = "192.168.1.100";
  const rateLimitKey = `rate_limit:${userIp}`;

  // Simulate multiple requests
  for (let i = 1; i <= 5; i++) {
    const currentRequests = (await redisService.get(rateLimitKey)) || 0;

    if (currentRequests >= 3) {
      // Giới hạn 3 requests
      console.log(`❌ Request ${i}: Rate limit exceeded!`);
    } else {
      await redisService.set(rateLimitKey, currentRequests + 1, 60); // 1 phút
      console.log(`✅ Request ${i}: Allowed (${currentRequests + 1}/3)`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Cleanup
  await redisService.del(rateLimitKey);
}

// ===== VÍ DỤ BULK OPERATIONS =====

async function bulkOperationsExample() {
  console.log("\n=== VÍ DỤ BULK OPERATIONS ===");

  // Lưu nhiều khóa cùng lúc
  const bulkData = {
    "config:app_name": "My Awesome App",
    "config:version": "1.0.0",
    "config:environment": "production",
    "stats:total_users": 1500,
    "stats:active_sessions": 45,
  };

  await redisService.mset(bulkData, 3600);
  console.log("✅ Đã lưu bulk data");

  // Lấy nhiều khóa cùng lúc
  const keys = Object.keys(bulkData);
  const retrievedData = await redisService.mget(keys);
  console.log("✅ Bulk data retrieved:", retrievedData);

  // Tìm kiếm theo pattern
  const configKeys = await redisService.keys("config:*");
  console.log("✅ Config keys:", configKeys);

  // Xóa theo pattern
  const deletedCount = await redisService.delPattern("config:*");
  console.log(`✅ Đã xóa ${deletedCount} config keys`);
}

// ===== VÍ DỤ ERROR HANDLING =====

async function errorHandlingExample() {
  console.log("\n=== VÍ DỤ ERROR HANDLING ===");

  try {
    // Thử các operations với error handling
    const result = await redisService.get("non_existent_key");
    console.log("✅ Non-existent key result:", result);

    const exists = await redisService.exists("non_existent_key");
    console.log("✅ Non-existent key exists:", exists);

    const ttl = await redisService.ttl("non_existent_key");
    console.log("✅ Non-existent key TTL:", ttl);
  } catch (error) {
    console.error("❌ Error occurred:", error.message);
  }
}

// ===== CHẠY TẤT CẢ VÍ DỤ =====

async function runAllExamples() {
  try {
    console.log("🚀 Bắt đầu chạy các ví dụ Redis Service...\n");

    await basicOperationsExample();
    await cachingExample();
    await sessionExample();
    await bulkOperationsExample();
    await rateLimitExample();
    await errorHandlingExample();

    // Pub/Sub chạy async để không block
    pubSubExample();

    console.log("\n✅ Hoàn thành tất cả ví dụ!");
  } catch (error) {
    console.error("❌ Lỗi khi chạy ví dụ:", error);
  }
}

// Export để có thể import và sử dụng
export {
  basicOperationsExample,
  cachingExample,
  sessionExample,
  pubSubExample,
  rateLimitExample,
  bulkOperationsExample,
  errorHandlingExample,
  runAllExamples,
};

// Nếu chạy trực tiếp file này
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
