import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

export const createUser = async (userData) => {
  return User.create(userData);
};

export const findAllUsers = async () => {
  return User.find()
    .select("-password")
    .lean();
};
export const findUserById = async (userId) => {
  return User.findById(userId)
    .select("first_name last_name email role")
    .lean();
};
