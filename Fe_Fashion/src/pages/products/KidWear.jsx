import { useParams } from "react-router-dom"
import DisplayProducts from "../../components/products/DisplayProducts"

export default function KidWear() {
  const { group, type } = useParams()

  const categorySlug = ["kid", group, type]
    .filter(Boolean)
    .join("-")

  return <DisplayProducts categorySlug={categorySlug} />
}
