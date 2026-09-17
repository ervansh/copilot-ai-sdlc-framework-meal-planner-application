import { BUNDLED_CATALOGUE } from './bundled-catalogue'
import { indexCatalogue } from '../domain/catalogue-index'

export const BUNDLED_CATALOGUE_INDEX_RESULT = indexCatalogue(BUNDLED_CATALOGUE)
export const BUNDLED_CATALOGUE_INDEX = BUNDLED_CATALOGUE_INDEX_RESULT.index

if (BUNDLED_CATALOGUE_INDEX_RESULT.errors.length > 0) {
  throw new Error('The bundled recipe catalogue contains invalid entries.')
}