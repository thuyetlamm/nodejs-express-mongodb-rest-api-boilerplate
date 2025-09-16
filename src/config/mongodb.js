import mongoose from "mongoose";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

export async function connect() {
  try {
    const client = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      dbName: process.env.DATABASE_NAME,
    });
    console.log("Connected successfully");
  } catch (error) {
    console.log(error);
    mongoose.close();
  }
}
