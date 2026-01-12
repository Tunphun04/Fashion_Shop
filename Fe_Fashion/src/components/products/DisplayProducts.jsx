import { useEffect, useState } from "react"
import { productApi } from "../../api/product.api"
import ProductCard from "./ProductCard"
import Filter from "../common/filter"

export default function DisplayProducts({ categorySlug, showFilter = true }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
      {showFilter && <Filter categorySlug={categorySlug} />}

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
