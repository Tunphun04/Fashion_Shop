import { IMAGE_BASE_URL } from "../../constant/env"
export default function ProductCard({ product }) {
    const imageUrl = product.main_image
    ? `${IMAGE_BASE_URL}${product.main_image}`
    : "/no-image.png"

  return (
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
      <div >
        <h3 className="mt-2 font-semibold">
        {product.name}
      </h3>

      <p className="text-sm text-gray-500">
        {product.brand_name}
      </p>

      <p className="text-red-600 font-bold mt-1">
        {product.price.toLocaleString()} đ
      </p>
      </div>
      
    </article>
  )
}
