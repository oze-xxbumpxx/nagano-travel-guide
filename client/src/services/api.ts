import axios from "axios";
import {
  accommodationFormData,
  attractionFormData,
  TravelPlanFormData,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3003/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Travel Plans API
export const travelAPI = {
  getAll: () => api.get("/travel"),
  getById: (id: number) => api.get(`/travel/${id}`),
  create: (data: TravelPlanFormData) => api.post("/travel", data),
  update: (id: number, data: TravelPlanFormData) =>
    api.put(`/travel/${id}`, data),
  delete: (id: number) => api.delete(`/travel/${id}`),
};

// Accommodations API
export const accommodationAPI = {
  getAll: () => api.get("/accommodations"),
  getById: (id: number) => api.get(`/accommodations/${id}`),
  create: (data: accommodationFormData) => api.post("/accommodations", data),
  update: (id: number, data: accommodationFormData) =>
    api.put(`/accommodations/${id}`, data),
  delete: (id: number) => api.delete(`/accommodations/${id}`),
};

// Attractions API
export const attractionAPI = {
  getAll: () => api.get("/attractions"),
  getById: (id: number) => api.get(`/attractions/${id}`),
  create: (data: attractionFormData) => api.post("/attractions", data),
  update: (id: number, data: attractionFormData) =>
    api.put(`/attractions/${id}`, data),
  delete: (id: number) => api.delete(`/attractions/${id}`),
};

export default api;
