const mongoose = require("mongoose");

const uri =
  "mongodb+srv://thuyetlam101:1gwmPMfqgwIAsZOV@cluster0.pifuz.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

export async function connect() {
  try {
    const client = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "motel",
    });
    console.log("Connected successfully");
  } catch (error) {
    console.log(error);
    mongoose.clo;
  }
}
