import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { productApi } from "../../api/product.api"
import Filter from "../common/filter"
import ProductCard from "./ProductCard"

export default function DisplayProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const pathname = location.pathname

  const isHome = pathname === "/" || pathname === "/home"

  // ===== PHÂN TÍCH URL =====
  const pathParts = pathname.split("/").filter(Boolean)
  // [] → home
  // ["men"]
  // ["men","clothing"]
  // ["men","clothing","tshirts"]

  let categorySlug = null

  if (pathParts.length === 1) {
    // /men
    categorySlug = pathParts[0]
  }

  if (pathParts.length === 2) {
    // /men/clothing
    categorySlug = `${pathParts[0]}-${pathParts[1]}`
  }

  if (pathParts.length === 3) {
    // /men/clothing/tshirts
    categorySlug = `${pathParts[0]}-${pathParts[1]}-${pathParts[2]}`
  }

  // ===== FETCH PRODUCTS =====
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)

        const res = await productApi.getProducts({
          category_slug: categorySlug
        })

        setProducts(res.data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug])

  if (loading) return <p className="px-20">Loading...</p>

  return (
    <div className="px-20 mt-3 flex flex-col">

      {/* CHỈ HIỆN FILTER KHI KHÔNG PHẢI HOME */}
      {!isHome && <Filter categorySlug={categorySlug} />}

      <section
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-6
          mt-5
        "
      >
        {products.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No products found
          </p>
        )}

        {products.map(product => (
          <ProductCard
            key={product.product_id}
            product={product}
          />
        ))}
      </section>
    </div>
  )
}
