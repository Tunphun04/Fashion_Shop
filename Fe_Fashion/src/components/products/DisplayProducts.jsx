import { useEffect, useState } from "react"
import { productApi } from "../../api/product.api"
import Filter from "../common/filter"
import ProductCard from "./ProductCard"

export default function DisplayProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await productApi.getProducts()
        setProducts(res.data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="px-20 mt-3 flex flex-col">
      <Filter />

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
