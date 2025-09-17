import clientRedis from "../config/redis.config.js";

class RedisService {
  constructor() {
    this.client = clientRedis;
  }

  // ===== CÁC CHỨC NĂNG CƠ BẢN =====

  /**
   * Lưu trữ dữ liệu vào Redis
   * @param {string} key - Khóa để lưu trữ
   * @param {any} value - Giá trị cần lưu
   * @param {number} ttl - Thời gian sống (giây), mặc định không hết hạn
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      console.error("Redis SET error:", error);
      return false;
    }
  }

  /**
   * Lấy dữ liệu từ Redis
   * @param {string} key - Khóa cần lấy
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }

  /**
   * Xóa dữ liệu khỏi Redis
   * @param {string} key - Khóa cần xóa
   * @returns {Promise<boolean>}
   */
  async del(key) {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("Redis DEL error:", error);
      return false;
    }
  }

  /**
   * Kiểm tra xem khóa có tồn tại không
   * @param {string} key - Khóa cần kiểm tra
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  /**
   * Lấy thời gian sống còn lại của khóa
   * @param {string} key - Khóa cần kiểm tra
   * @returns {Promise<number>} - Thời gian còn lại (giây), -1 nếu không có TTL, -2 nếu không tồn tại
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error);
      return -2;
    }
  }

  // ===== CÁC CHỨC NĂNG NÂNG CAO =====

  /**
   * Lưu trữ nhiều khóa cùng lúc
   * @param {Object} keyValuePairs - Object chứa các cặp key-value
   * @param {number} ttl - Thời gian sống chung cho tất cả khóa
   * @returns {Promise<boolean>}
   */
  async mset(keyValuePairs, ttl = null) {
    try {
      const pipeline = this.client.multi();

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setEx(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error("Redis MSET error:", error);
      return false;
    }
  }

  /**
   * Lấy nhiều khóa cùng lúc
   * @param {string[]} keys - Mảng các khóa cần lấy
   * @returns {Promise<Object>} - Object chứa key-value pairs
   */
  async mget(keys) {
    try {
      const values = await this.client.mGet(keys);
      const result = {};

      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        }
      });

      return result;
    } catch (error) {
      console.error("Redis MGET error:", error);
      return {};
    }
  }

  /**
   * Tìm kiếm các khóa theo pattern
   * @param {string} pattern - Pattern để tìm kiếm (ví dụ: "user:*")
   * @returns {Promise<string[]>}
   */
  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error("Redis KEYS error:", error);
      return [];
    }
  }

  /**
   * Xóa tất cả khóa theo pattern
   * @param {string} pattern - Pattern để xóa
   * @returns {Promise<number>} - Số lượng khóa đã xóa
   */
  async delPattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      console.error("Redis DEL pattern error:", error);
      return 0;
    }
  }

  // ===== CACHING FUNCTIONS =====

  /**
   * Cache với fallback function
   * @param {string} key - Khóa cache
   * @param {Function} fallbackFn - Function để lấy dữ liệu nếu cache miss
   * @param {number} ttl - Thời gian sống cache (giây)
   * @returns {Promise<any>}
   */
  async cache(key, fallbackFn, ttl = 3600) {
    try {
      // Thử lấy từ cache trước
      let data = await this.get(key);

      if (data !== null) {
        return data;
      }

      // Nếu cache miss, gọi fallback function
      data = await fallbackFn();

      // Lưu vào cache
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error("Redis CACHE error:", error);
      // Nếu có lỗi, vẫn cố gắng gọi fallback function
      return await fallbackFn();
    }
  }

  /**
   * Invalidate cache theo pattern
   * @param {string} pattern - Pattern để invalidate
   * @returns {Promise<number>} - Số lượng cache đã xóa
   */
  async invalidateCache(pattern) {
    return await this.delPattern(pattern);
  }

  // ===== SESSION MANAGEMENT =====

  /**
   * Lưu session
   * @param {string} sessionId - ID của session
   * @param {Object} sessionData - Dữ liệu session
   * @param {number} ttl - Thời gian sống session (giây)
   * @returns {Promise<boolean>}
   */
  async setSession(sessionId, sessionData, ttl = 86400) {
    // 24 giờ mặc định
    const key = `session:${sessionId}`;
    return await this.set(key, sessionData, ttl);
  }

  /**
   * Lấy session
   * @param {string} sessionId - ID của session
   * @returns {Promise<Object|null>}
   */
  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  /**
   * Xóa session
   * @param {string} sessionId - ID của session
   * @returns {Promise<boolean>}
   */
  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // ===== PUB/SUB FUNCTIONS =====

  /**
   * Publish message đến channel
   * @param {string} channel - Tên channel
   * @param {any} message - Message cần gửi
   * @returns {Promise<number>} - Số lượng subscriber nhận được message
   */
  async publish(channel, message) {
    try {
      const serializedMessage = JSON.stringify(message);
      return await this.client.publish(channel, serializedMessage);
    } catch (error) {
      console.error("Redis PUBLISH error:", error);
      return 0;
    }
  }

  /**
   * Subscribe vào channel
   * @param {string} channel - Tên channel
   * @param {Function} callback - Callback function khi nhận message
   * @returns {Promise<Object>} - Redis subscriber client
   */
  async subscribe(channel, callback) {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();

      await subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          console.error("Error parsing subscribed message:", error);
        }
      });

      return subscriber;
    } catch (error) {
      console.error("Redis SUBSCRIBE error:", error);
      return null;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Lấy thông tin server Redis
   * @returns {Promise<Object>}
   */
  async getInfo() {
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error("Redis INFO error:", error);
      return null;
    }
  }

  /**
   * Kiểm tra kết nối Redis
   * @returns {Promise<boolean>}
   */
  async ping() {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("Redis PING error:", error);
      return false;
    }
  }

  /**
   * Xóa tất cả dữ liệu trong database hiện tại
   * @returns {Promise<boolean>}
   */
  async flushAll() {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error("Redis FLUSHALL error:", error);
      return false;
    }
  }

  /**
   * Đóng kết nối Redis
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await this.client.disconnect();
      console.log("Redis connection closed");
    } catch (error) {
      console.error("Redis DISCONNECT error:", error);
    }
  }
}

// Tạo instance singleton
const redisService = new RedisService();

export default redisService;
