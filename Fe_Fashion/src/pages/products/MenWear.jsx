import { useParams } from "react-router-dom"
import DisplayProducts from "../../components/products/DisplayProducts"

export default function MenWear() {
  const { group, type } = useParams()

  const categorySlug = ["men", group, type]
    .filter(Boolean)
    .join("-")

  return <DisplayProducts categorySlug={categorySlug} />
}
