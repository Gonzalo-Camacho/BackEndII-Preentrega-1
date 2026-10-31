import {
  findUserByEmail,
  createUser,
  findAllUsers
} from "../dao/users.dao.js";

export const getUserByEmail = async (email) => {
  return findUserByEmail(email);
};

export const saveUser = async (userData) => {
  return createUser(userData);
};

export const getAllUsers = async () => {
  return findAllUsers();
};