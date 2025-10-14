import type { App } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'

// Export converter functions
export { toSQL, toMongo, fromSQL, fromMongo, toMnpQuery } from './utils/query-converter'

export { QueryBuilder }
export { FilterType, Operator }
export type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter }

export const install = (app: App) => {
  app.component('QueryBuilder', QueryBuilder)
}
