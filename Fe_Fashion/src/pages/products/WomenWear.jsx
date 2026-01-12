import { useParams } from "react-router-dom"
import DisplayProducts from "../../components/products/DisplayProducts"

export default function WomenWear() {
  const { group, type } = useParams()

  const categorySlug = ["women", group, type]
    .filter(Boolean)
    .join("-")

  return <DisplayProducts categorySlug={categorySlug} />
}
