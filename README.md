# Vue 3 QueryBuilder

A powerful and flexible query builder component for Vue 3 with Element Plus.

## Installation

```bash
npm install @mvtcode/vue3-querybuilder
```

## Repository

```bash
git clone git@github.com:mvtcode/vue3-querybuilder.git
```

## Usage

```vue
<template>
  <QueryBuilder v-model="query" :filters="filters" @update:modelValue="onQueryChange" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QueryBuilder } from '@mvtcode/vue3-querybuilder'
import type { QueryBuilderRule, QueryBuilderGroup } from '@mvtcode/vue3-querybuilder'

const query = ref<QueryBuilderRule | QueryBuilderGroup>({
  type: 'rule',
  field: 'name',
  operator: 'equal',
  value: '',
})

const filters = [
  {
    field: 'name',
    label: 'Name',
    type: 'string',
    operators: ['equal', 'not_equal', 'contains', 'not_contains'],
  },
  {
    field: 'age',
    label: 'Age',
    type: 'number',
    operators: ['equal', 'not_equal', 'greater', 'less'],
  },
]

const onQueryChange = (newQuery: QueryBuilderRule | QueryBuilderGroup) => {
  console.log('Query changed:', newQuery)
}
</script>
```

## Props

| Prop       | Type                                    | Default | Description                |
| ---------- | --------------------------------------- | ------- | -------------------------- |
| modelValue | `QueryBuilderRule \| QueryBuilderGroup` | -       | The current query value    |
| filters    | `Filter[]`                              | `[]`    | Array of available filters |

## Events

| Event             | Parameters                                       | Description                          |
| ----------------- | ------------------------------------------------ | ------------------------------------ |
| update:modelValue | `(value: QueryBuilderRule \| QueryBuilderGroup)` | Emitted when the query value changes |

## Types

```typescript
interface Filter {
  field: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date'
  operators: string[]
}

interface QueryBuilderRule {
  type: 'rule'
  field: string
  operator: string
  value: any
}

interface QueryBuilderGroup {
  type: 'group'
  condition: 'and' | 'or'
  rules: (QueryBuilderRule | QueryBuilderGroup)[]
}
```

## License

MIT
