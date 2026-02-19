import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (data) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, data);
  return response.data;
};