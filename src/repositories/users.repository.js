import {
  findUserByEmail,
  createUser
} from "../dao/users.dao.js";

export const getUserByEmail = async (email) => {
  return findUserByEmail(email);
};

export const saveUser = async (userData) => {
  return createUser(userData);
};