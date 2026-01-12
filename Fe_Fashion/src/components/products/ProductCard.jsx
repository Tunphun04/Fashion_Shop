import { Link } from "react-router-dom"
import { IMAGE_BASE_URL } from "../../constant/env"

export default function ProductCard({ product }) {
  const imageUrl = product.main_image
    ? product.main_image.startsWith("http")
      ? product.main_image
      : `${IMAGE_BASE_URL}${product.main_image}`
    : "/no-image.png"

  const isOnSale = product.is_on_sale === 1

  return (
    <Link to={`/product/${product.slug}`}>
      <article
        className="
          border rounded-lg p-3
          transition-transform duration-300 ease-in-out
          hover:scale-105 hover:shadow-lg cursor-pointer
        "
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded"
          onError={(e) => {
            e.target.src = "/no-image.png"
          }}
        />

        <div>
          <h3 className="mt-2 font-semibold">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500">
            {product.brand_name}
          </p>

          {isOnSale ? (
            <div className="flex flex-row mt-1 items-center">
              <span className="text-sm text-gray-400 line-through mr-2">
                {Number(product.original_price).toLocaleString()} đ
              </span>

              <span className="text-xs bg-red-100 text-red-600 font-semibold rounded px-1">
                -{product.sale_percent}%
              </span>

              <p className="text-red-600 font-bold text-lg ml-2">
                {Number(product.price).toLocaleString()} đ
              </p>
            </div>
          ) : (
            <p className="text-red-600 font-bold mt-1">
              {Number(product.price).toLocaleString()} đ
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
