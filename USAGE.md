# Hướng dẫn sử dụng Vue3 QueryBuilder

## Cài đặt

```bash
npm install @mvtcode/vue3-querybuilder
```

## Sử dụng trong Vue 3

### 1. Import và sử dụng component

```typescript
import { createApp } from 'vue'
import { QueryBuilder, FilterType, Operator } from '@mvtcode/vue3-querybuilder'
import '@mvtcode/vue3-querybuilder/style.css'

const app = createApp({
  components: {
    QueryBuilder,
  },
})
```

### 2. Sử dụng với Element Plus

```vue
<template>
  <QueryBuilder v-model="query" :filters="filters" :options="options" @change="handleQueryChange" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QueryBuilder, FilterType, Operator } from '@mvtcode/vue3-querybuilder'
import type { QueryBuilderGroup, QueryBuilderFilter } from '@mvtcode/vue3-querybuilder'

const query = ref<QueryBuilderGroup>({
  condition: 'AND',
  rules: [],
})

const filters: QueryBuilderFilter[] = [
  {
    field: 'name',
    label: 'Tên',
    type: FilterType.STRING,
    operators: [Operator.EQUAL, Operator.CONTAINS],
  },
  {
    field: 'age',
    label: 'Tuổi',
    type: FilterType.NUMBER,
    operators: [Operator.EQUAL, Operator.GREATER, Operator.LESS],
  },
]

const options = {
  filters,
  defaultFilter: 'name',
  defaultOperator: Operator.EQUAL,
  defaultCondition: 'AND' as const,
  allowGroups: true,
  allowEmpty: true,
}

const handleQueryChange = (newQuery: QueryBuilderGroup) => {
  console.log('Query changed:', newQuery)
}
</script>
```

### 3. Sử dụng converter functions

```typescript
import { toSQL, toMongo, fromSQL, fromMongo } from '@mvtcode/vue3-querybuilder'

// Chuyển đổi query thành SQL
const sqlQuery = toSQL(query.value)

// Chuyển đổi query thành MongoDB query
const mongoQuery = toMongo(query.value)

// Chuyển đổi từ SQL về query builder format
const queryFromSQL = fromSQL(sqlQuery)

// Chuyển đổi từ MongoDB query về query builder format
const queryFromMongo = fromMongo(mongoQuery)
```

## Types

Module cung cấp đầy đủ TypeScript types:

- `QueryBuilderGroup`: Cấu trúc nhóm query
- `QueryBuilderRule`: Cấu trúc rule trong query
- `QueryBuilderFilter`: Cấu trúc filter
- `QueryBuilderOptions`: Tùy chọn cho component
- `FilterType`: Enum các loại filter
- `Operator`: Enum các toán tử

## Yêu cầu

- Vue 3.x
- Element Plus 2.x
- @element-plus/icons-vue 2.x

## Lưu ý

- Module đã được cấu hình đúng để hỗ trợ TypeScript
- Không cần tạo file `vue3-querybuilder.d.ts` thủ công
- Tất cả types đã được export sẵn trong module
