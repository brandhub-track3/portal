import { DetailView } from '../components/DetailView'

export function DetailPage({ item, relatedItems, onBack }) {
  return <DetailView item={item} relatedItems={relatedItems} onBack={onBack} />
}
