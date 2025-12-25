import axiosClient from "../utils/axiosClient"

export const productApi = {
  getProducts(params = {}) {
    return axiosClient.get("/products", { params })
  },

  getProductBySlug(slug) {
    return axiosClient.get(`/products/slug/${slug}`)
  }
}
