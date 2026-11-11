import { DetailView } from '../components/DetailView'

export function DetailPage({ item, isLoading, error, retry, onBack }) {
  return <DetailView item={item} isLoading={isLoading} error={error} retry={retry} onBack={onBack} />
}
