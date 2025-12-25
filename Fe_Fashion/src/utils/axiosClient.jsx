import axios from "axios"
import { API_BASE_URL, API_VERSION } from "../constant/env"

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    "Content-Type": "application/json"
  }
})

axiosClient.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default axiosClient
