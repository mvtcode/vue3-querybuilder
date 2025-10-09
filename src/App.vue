<script lang="ts" setup>
import { ref } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'

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
    field: 'email',
    label: 'Email',
    type: FilterType.EMAIL,
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.CONTAINS, Operator.NOT_CONTAINS],
    input: 'email',
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
    input: 'checkbox',
  },
  {
    field: 'status',
    label: 'Status',
    type: FilterType.STRING,
    input: 'select',
    value: 'pending', // Giá trị mặc định
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN],
  },
]
</script>

<template>
  <div class="app">
    <h1>Vue 3 QueryBuilder Demo</h1>
    <QueryBuilder v-model="rules" :filters="filters">
      <template #email="{ rule, widthValueInput }">
        <el-input
          v-model="rule.value"
          placeholder="Enter email"
          clearable
          :style="{ width: `${widthValueInput}px` }"
        />
      </template>
      <template #age="{ isBetween, rule, widthValueInput }">
        <el-input-number
          v-if="!isBetween"
          v-model="rule.value"
          :min="0"
          :max="100"
          clearable
          :style="{ width: `${widthValueInput}px` }"
        />
        <div v-else style="display: flex; align-items: center; gap: 10px">
          <el-input-number
            v-model="(rule.value as number[])[0]"
            :min="0"
            :max="100"
            clearable
            :style="{ width: `${widthValueInput}px` }"
          />
          <span>and</span>
          <el-input-number
            v-model="(rule.value as number[])[1]"
            :min="0"
            :max="100"
            clearable
            :style="{ width: `${widthValueInput}px` }"
          />
        </div>
      </template>
      <template #birthdate="{ rule, isBetween, widthValueInput }">
        <el-date-picker
          v-model="rule.value"
          :type="isBetween ? 'daterange' : 'date'"
          placeholder="Select date"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          clearable
          :style="{ width: `${widthValueInput}px` }"
        />
      </template>
      <template #active="{ rule, widthValueInput }">
        <el-checkbox v-model="rule.value" :style="{ width: `${widthValueInput}px` }"
          >Active/Inactive</el-checkbox
        >
      </template>
      <template #status="{ rule, widthValueInput }">
        <el-select
          v-model="rule.value"
          placeholder="Select status"
          :multiple="[Operator.IN, Operator.NOT_IN].includes(rule.operator)"
          clearable
          :style="{ width: `${widthValueInput}px` }"
        >
          <el-option label="Pending" value="pending" />
          <el-option label="Completed" value="completed" />
        </el-select>
      </template>
    </QueryBuilder>
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
