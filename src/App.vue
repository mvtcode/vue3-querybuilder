<script lang="ts" setup>
import { ref, computed } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'
import { toSQL, toMongo, toMnpQuery } from './utils/query-converter'

const rules = ref<QueryBuilderGroup>({
  condition: 'AND',
  rules: [],
})

import packageJson from '../package.json'

const language = ref<'vi' | 'en'>('vi')
const size = ref<'small' | 'default' | 'large'>('default')
const maxDepth = ref(3)

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
      Operator.ENDS_WITH,
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
    ],
  },
  {
    field: 'email',
    label: 'Email',
    type: FilterType.EMAIL,
    operators: [
      Operator.EQUAL,
      Operator.NOT_EQUAL,
      Operator.CONTAINS,
      Operator.NOT_CONTAINS,
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
    ],
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
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
    ],
  },
  {
    field: 'birthdate',
    label: 'Birth Date',
    type: FilterType.DATE,
    input: 'date',
    operators: [
      Operator.EQUAL,
      Operator.NOT_EQUAL,
      Operator.GREATER,
      Operator.GREATER_OR_EQUAL,
      Operator.LESS,
      Operator.LESS_OR_EQUAL,
      Operator.BETWEEN,
      Operator.NOT_BETWEEN,
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
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
    value: 'pending',
    values: [
      { text: 'Pending', value: 'pending' },
      { text: 'Completed', value: 'completed' },
    ],
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN],
  },
]

const sqlQuery = computed(() => toSQL(rules.value))
const mongoQuery = computed(() => toMongo(rules.value))
const mnpQuery = computed(() => toMnpQuery(rules.value, filters))
</script>

<template>
  <div class="app">
    <div class="header">
      <div class="app-title">
        <h1>Vue 3 QueryBuilder</h1>
        <el-tag size="small" round type="primary">v{{ packageJson.version }}</el-tag>
      </div>
      <div class="controls">
        <el-radio-group v-model="language" size="small">
          <el-radio-button label="English" value="en" />
          <el-radio-button label="Tiếng Việt" value="vi" />
        </el-radio-group>
        <el-radio-group v-model="size" size="small">
          <el-radio-button label="Small" value="small" />
          <el-radio-button label="Default" value="default" />
          <el-radio-button label="Large" value="large" />
        </el-radio-group>
        <div class="depth-control">
          <span>Max Depth:</span>
          <el-input-number v-model="maxDepth" :min="1" :max="10" size="small" />
        </div>
      </div>
    </div>

    <QueryBuilder
      v-model="rules"
      :filters="filters"
      :language="language"
      :size="size"
      :max-depth="maxDepth"
    >
      <template #email="{ rule, widthValueInput, size, filter }">
        <el-input
          v-model="rule.value"
          :placeholder="filter?.label"
          clearable
          :style="{ width: `${widthValueInput}px` }"
          :size="size"
        />
      </template>
      <template #age="{ isBetween, rule, widthValueInput, size }">
        <el-input-number
          v-if="!isBetween"
          v-model="rule.value"
          :min="0"
          :max="100"
          clearable
          :style="{ width: `${widthValueInput}px` }"
          :size="size"
        />
        <div v-else style="display: flex; align-items: center; gap: 10px">
          <el-input-number
            v-model="(rule.value as number[])[0]"
            :min="0"
            :max="100"
            :style="{ width: `${widthValueInput / 2 - 5}px` }"
            :size="size"
          />
          <span>-</span>
          <el-input-number
            v-model="(rule.value as number[])[1]"
            :min="0"
            :max="100"
            :style="{ width: `${widthValueInput / 2 - 5}px` }"
            :size="size"
          />
        </div>
      </template>
      <template #birthdate="{ rule, isBetween, widthValueInput, size, filter }">
        <el-date-picker
          v-model="rule.value"
          :type="isBetween ? 'daterange' : 'date'"
          :placeholder="filter?.label"
          range-separator="-"
          start-placeholder="Start"
          end-placeholder="End"
          clearable
          :style="{ width: `${widthValueInput}px`, maxWidth: `${widthValueInput}px` }"
          :size="size"
        />
      </template>
      <template #active="{ rule, size }">
        <el-checkbox v-model="rule.value" :size="size">Active/Inactive</el-checkbox>
      </template>
      <template #status="{ rule, widthValueInput, size, filter }">
        <el-select
          v-model="rule.value"
          :placeholder="filter?.label"
          :multiple="[Operator.IN, Operator.NOT_IN].includes(rule.operator)"
          clearable
          :style="{ width: `${widthValueInput}px` }"
          :size="size"
        >
          <el-option
            v-for="item in filter?.values || []"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
    </QueryBuilder>

    <div class="output-container">
      <div class="output-section">
        <h3>SQL Query:</h3>
        <pre>{{ sqlQuery }}</pre>
      </div>
      <div class="output-section">
        <h3>Mongo Query:</h3>
        <pre>{{ JSON.stringify(mongoQuery, null, 2) }}</pre>
      </div>
      <div class="output-section">
        <h3>MNP Query:</h3>
        <pre>{{ mnpQuery }}</pre>
      </div>
      <div class="output-section">
        <h3>Raw Rules:</h3>
        <pre>{{ JSON.stringify(rules, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .app-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
.controls {
  display: flex;
  gap: 20px;
  align-items: center;
}
.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.output-container {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}
.output-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  h3 {
    margin-top: 0;
    font-size: 16px;
    color: #495057;
  }
}
pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 13px;
  color: #212529;
}
</style>
