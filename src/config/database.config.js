import mongoose from "mongoose";
import { MONGO_URL } from "./env.config.js";

export const connectDatabase = async () => {
  await mongoose.connect(MONGO_URL);
  console.log("Conectado a MongoDB");
};