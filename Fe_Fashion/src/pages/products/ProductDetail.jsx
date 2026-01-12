import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { productApi } from "../../api/product.api"
import { IMAGE_BASE_URL } from "../../constant/env"

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)
        
        const res = await productApi.getProductBySlug(slug)
        
        console.log('=== DEBUG ===')
        console.log('Full res:', res)
        console.log('res.data:', res.data)  // ← Đây mới là product object
        console.log('============')
        
        // ✅ ĐÚNG: res.data chứa product object
        setProduct(res.data)
        
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err.response?.data?.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="px-20 py-40 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-20 py-40 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="px-20 py-40 text-center">
        <p className="text-lg">Product not found</p>
      </div>
    )
  }

  const imageUrl = product.main_image?.startsWith("http")
    ? product.main_image
    : `${IMAGE_BASE_URL}${product.main_image}`

  return (
    <div className="px-20 mt-40 mb-20 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* IMAGE */}
      <div>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-[500px] object-cover rounded"
          onError={(e) => {
            e.target.src = "/no-image.png"
          }}
        />
      </div>

      {/* INFO */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-gray-500 mt-2 text-lg">{product.brand_name}</p>

        {product.is_on_sale === 1 ? (
          <div className="mt-4">
            <span className="text-gray-400 line-through text-xl mr-3">
              {Number(product.original_price).toLocaleString()} đ
            </span>
            <span className="text-red-600 text-3xl font-bold">
              {Number(product.price).toLocaleString()} đ
            </span>
            <span className="ml-3 bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
              -{product.sale_percent}%
            </span>
          </div>
        ) : (
          <p className="text-red-600 text-3xl font-bold mt-4">
            {Number(product.price).toLocaleString()} đ
          </p>
        )}

        <p className="mt-6 text-gray-700 leading-relaxed">
          {product.description || 'No description available'}
        </p>

        {/* Available Colors */}
        {product.available_colors?.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold mb-2">Available Colors:</p>
            <div className="flex gap-2 flex-wrap">
              {product.available_colors.map((color, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Sizes */}
        {product.available_sizes?.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Available Sizes:</p>
            <div className="flex gap-2 flex-wrap">
              {product.available_sizes.map((size, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ACTION */}
        <button className="mt-8 px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Add to cart
        </button>
      </div>
    </div>
  )
}