import mongoose from "mongoose";

const globalWithMongoose = global as typeof global & {
  mongooseConn?: typeof mongoose;
};

const { MONGODB_URI = "mongodb://localhost:27017/erp-json-designer" } =
  process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI não configurada");
}

export async function connectDatabase() {
  if (globalWithMongoose.mongooseConn) {
    return globalWithMongoose.mongooseConn;
  }

  await mongoose.connect(MONGODB_URI, {
    autoCreate: true,
  });

  globalWithMongoose.mongooseConn = mongoose;
  return mongoose;
}

export default connectDatabase;
