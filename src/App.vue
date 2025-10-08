<script lang="ts">
import { defineComponent, ref } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'

export default defineComponent({
  name: 'App',
  components: {
    QueryBuilder,
  },
  setup() {
    const rules = ref<QueryBuilderGroup>({
      condition: 'AND',
      rules: [],
    })

    const filters: QueryBuilderFilter[] = [
      {
        field: 'name',
        label: 'Name',
        type: FilterType.STRING,
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.CONTAINS,
          Operator.NOT_CONTAINS,
          Operator.BEGINS_WITH,
          Operator.NOT_BEGINS_WITH,
          Operator.ENDS_WITH,
          Operator.NOT_ENDS_WITH,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
      },
      {
        field: 'age',
        label: 'Age',
        type: FilterType.INTEGER,
        validation: {
          min: 0,
          max: 100,
        },
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER,
          Operator.GREATER_OR_EQUAL,
          Operator.LESS,
          Operator.LESS_OR_EQUAL,
          Operator.BETWEEN,
          Operator.NOT_BETWEEN,
        ],
      },
      {
        field: 'birthdate',
        label: 'Birth Date',
        type: FilterType.DATE,
        input: 'date',
        validation: {
          format: 'YYYY-MM-DD',
        },
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER,
          Operator.GREATER_OR_EQUAL,
          Operator.LESS,
          Operator.LESS_OR_EQUAL,
          Operator.BETWEEN,
          Operator.NOT_BETWEEN,
        ],
      },
      {
        field: 'active',
        label: 'Active',
        type: FilterType.BOOLEAN,
        input: 'radio',
        values: [
          { value: '1', text: 'Yes' },
          { value: '0', text: 'No' },
        ],
      },
      {
        field: 'status',
        label: 'Status',
        type: FilterType.STRING,
        input: 'select',
        values: [
          { value: 'pending', text: 'Pending' },
          { value: 'processing', text: 'Processing' },
          { value: 'completed', text: 'Completed' },
          { value: 'cancelled', text: 'Cancelled' },
          { value: 'failed', text: 'Failed' },
        ],
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN],
      },
    ]

    return {
      rules,
      filters,
    }
  },
})
</script>

<template>
  <div class="app">
    <h1>Vue 3 QueryBuilder Demo</h1>
    <QueryBuilder v-model="rules" :filters="filters" />
    <div class="rules-display">
      <h3>Current Rules:</h3>
      <pre>{{ JSON.stringify(rules, null, 2) }}</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
pre {
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
</style>
