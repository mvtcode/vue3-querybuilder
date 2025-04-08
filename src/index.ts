import type { App } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'

export { QueryBuilder }

export default {
  install: (app: App) => {
    app.component('QueryBuilder', QueryBuilder)
  },
}
