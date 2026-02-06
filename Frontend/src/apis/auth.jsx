import axios from "axios";

const API_URL = import.meta.env.API_URL;

export const loginUser = async (data) => {
  const response = await axios.post("http://localhost:5000/api/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await axios.post(`http://localhost:5000/api/auth/signup`, data);
  return response.data;
};