import Art from './Art.jsx'
import { pickArt } from '../lib/illustrations.js'

export default function ProductCard({ product, categoryName, index }) {
  return (
    <div className="card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="im">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} loading="lazy" />
          : <Art id={pickArt(categoryName, product.name)} />}
      </div>
      <div className="tx">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="pr">{Number(product.price).toLocaleString('ar-EG')}<small>ج.م</small></span>
      </div>
    </div>
  )
}
