import { createClient } from "redis";

const clientRedis = createClient({
  url: process.env.REDIS_URL,
});
clientRedis.on("error", (err) => console.log("Redis Client Error", err));

const connect = async () => {
  await clientRedis.connect();
  console.log("REDIS:::::: Connected");
};
connect();
export default clientRedis;
