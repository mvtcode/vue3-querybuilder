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
import { FilterType, Operator } from '@mvtcode/vue3-querybuilder'

const query = ref<QueryBuilderRule | QueryBuilderGroup>({
  type: 'rule',
  field: 'name',
  operator: Operator.EQUAL,
  value: '',
})

const filters = [
  {
    field: 'name',
    label: 'Name',
    type: FilterType.STRING,
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.CONTAINS, Operator.NOT_CONTAINS],
  },
  {
    field: 'age',
    label: 'Age',
    type: FilterType.NUMBER,
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.GREATER, Operator.LESS],
  },
]

const onQueryChange = (newQuery: QueryBuilderRule | QueryBuilderGroup) => {
  console.log('Query changed:', newQuery)
}
</script>
```

## Enums

### FilterType

```typescript
enum FilterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
}
```

### Operator

```typescript
enum Operator {
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  BEGINS_WITH = 'begins_with',
  ENDS_WITH = 'ends_with',
  GREATER = 'greater',
  GREATER_OR_EQUAL = 'greater_or_equal',
  LESS = 'less',
  LESS_OR_EQUAL = 'less_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}
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

## Filter Configuration

Each filter can be configured with the following properties:

```typescript
interface Filter {
  field: string // Field name
  label: string // Display label
  type: 'string' | 'number' | 'boolean' | 'date' // Data type
  operators: string[] // Allowed operators
  input?: string // Input type ('select', 'radio', 'date', etc.)
  values?: Array<{
    // Values for select/radio
    value: string
    text: string
  }>
  validation?: {
    // Validation rules
    format?: string // Format for date (YYYY-MM-DD)
    min?: number // Minimum value for number
    max?: number // Maximum value for number
    step?: number // Step for number
  }
}
```

## Filter Types

### 1. Text (STRING)

```typescript
{
  field: 'name',
  label: 'Name',
  type: 'string',
  operators: ['equal', 'not_equal', 'contains', 'not_contains']
}
```

### 2. Number

```typescript
{
  field: 'age',
  label: 'Age',
  type: 'number',
  operators: ['equal', 'not_equal', 'greater', 'less'],
  validation: {
    min: 0,
    max: 100
  }
}
```

### 3. Date

```typescript
{
  field: 'birthdate',
  label: 'Birth Date',
  type: 'date',
  input: 'date',
  validation: {
    format: 'YYYY-MM-DD'
  }
}
```

### 4. Boolean

```typescript
{
  field: 'active',
  label: 'Active',
  type: 'boolean',
  input: 'radio',
  values: [
    { value: '1', text: 'Yes' },
    { value: '0', text: 'No' }
  ]
}
```

### 5. Select (Dropdown)

```typescript
{
  field: 'status',
  label: 'Status',
  type: 'string',
  input: 'select',
  values: [
    { value: 'pending', text: 'Pending' },
    { value: 'completed', text: 'Completed' }
  ],
  operators: ['equal', 'not_equal', 'in', 'not_in']
}
```

## Operators

Component supports the following operators:

- `equal`: Equal (=)
- `not_equal`: Not Equal (≠)
- `contains`: Contains (⊃)
- `not_contains`: Not Contains (⊅)
- `begins_with`: Begins With
- `ends_with`: Ends With
- `greater`: Greater Than (>)
- `greater_or_equal`: Greater Than or Equal (≥)
- `less`: Less Than (<)
- `less_or_equal`: Less Than or Equal (≤)
- `in`: In List
- `not_in`: Not In List
- `between`: Between
- `not_between`: Not Between
- `is_empty`: Is Empty
- `is_not_empty`: Is Not Empty

## Query Result

The result is returned as an object with the following structure:

```typescript
{
  type: 'group',
  condition: 'and' | 'or',
  rules: [
    {
      type: 'rule',
      field: string,
      operator: string,
      value: any
    },
    // or another group
    {
      type: 'group',
      condition: 'and' | 'or',
      rules: []
    }
  ]
}
```

## Development

```sh
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm run test:unit

# Lint and fix files
npm run lint
```

## License

MIT

## Author

- **Name**: Tan MV
- **Email**: tanmv@mpos.vn
- **Telegram**: tanmac
