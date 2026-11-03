export default function Art({ id, className }) {
  return <svg className={className} aria-hidden="true"><use href={`#${id}`} /></svg>
}
