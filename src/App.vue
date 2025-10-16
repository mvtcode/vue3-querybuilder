<script lang="ts" setup>
import { ref } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'
import { toMongo, toSQL, toMnpQuery } from './utils/query-converter'

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
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
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
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
    ],
  },
  {
    field: 'birthdatetime',
    label: 'Birth DateTime',
    type: FilterType.DATETIME,
    input: 'date',
    validation: {
      format: 'YYYY-MM-DD HH:mm:ss',
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
    operators: [
      Operator.EQUAL,
      Operator.NOT_EQUAL,
      Operator.IN,
      Operator.NOT_IN,
      Operator.IS_EMPTY,
      Operator.IS_NOT_EMPTY,
    ],
  },
]
</script>

<template>
  <el-container>
    <el-header>
      <h1>Vue 3 QueryBuilder Demo</h1>
    </el-header>
    <el-main>
      <QueryBuilder
        v-model="rules"
        :filters="filters"
        :is-show-operator="false"
        :max-depth="3"
        label-add-rule="Thêm Rule"
        label-add-group="Thêm Group"
        label-remove-group="Xóa Group"
        label-from="Từ"
        label-to="Đến"
        label-and="Và"
        label-or="Hoặc"
      >
        <template #email="{ rule, widthValueInput }">
          <el-input
            v-model="rule.value"
            placeholder="Enter email"
            clearable
            :style="{ width: `${widthValueInput}px` }"
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
          />
        </template>
        <template #age="{ isBetween, rule, widthValueInput }">
          <el-input-number
            v-if="!isBetween"
            v-model="rule.value"
            :min="0"
            :max="1_000_000"
            clearable
            :style="{ width: `${widthValueInput}px` }"
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
          />
          <div v-else style="display: flex; align-items: center; gap: 10px">
            <el-input-number
              v-model="(rule.value as number[])[0]"
              :min="0"
              :max="1_000_000"
              clearable
              :style="{ width: `${widthValueInput}px` }"
              :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
            />
            <span>and</span>
            <el-input-number
              v-model="(rule.value as number[])[1]"
              :min="0"
              :max="1_000_000"
              clearable
              :style="{ width: `${widthValueInput}px` }"
              :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
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
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
          />
        </template>
        <template #birthdatetime="{ rule, isBetween, widthValueInput }">
          <el-date-picker
            v-model="rule.value"
            :type="isBetween ? 'datetimerange' : 'datetime'"
            placeholder="Select datetime"
            range-separator="To"
            start-placeholder="Start datetime"
            end-placeholder="End datetime"
            clearable
            :style="{ width: `${widthValueInput}px` }"
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
          />
        </template>
        <template #active="{ rule, widthValueInput }">
          <el-checkbox
            v-model="rule.value"
            :style="{ width: `${widthValueInput}px` }"
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
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
            :disabled="[Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
          >
            <el-option label="Pending" value="pending" />
            <el-option label="Completed" value="completed" />
          </el-select>
        </template>
      </QueryBuilder>

      <el-row :gutter="10" style="margin-top: 10px">
        <el-col :span="12">
          <el-card shadow="never">
            <h3>Current Rules:</h3>
            <el-scrollbar height="200px" always class="border-box">
              <pre>{{ JSON.stringify(rules, null, 2) }}</pre>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <h3>Mongo Query:</h3>
            <el-scrollbar height="200px" always class="border-box">
              <pre>{{ toMongo(rules) }}</pre>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="12" style="margin-top: 10px">
          <el-card shadow="never">
            <h3>SQL Query:</h3>
            <el-scrollbar height="100px" always class="border-box">
              <pre>{{ toSQL(rules) }}</pre>
            </el-scrollbar>
          </el-card>
        </el-col>
        <el-col :span="12" style="margin-top: 10px">
          <el-card shadow="never">
            <h3>MNP Query:</h3>
            <el-scrollbar height="100px" always class="border-box">
              <pre>{{ toMnpQuery(rules, filters) }}</pre>
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
h3 {
  margin-bottom: 10px;
  margin-top: 0;
}
pre {
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.border-box {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 0 10px;
}
:deep(.el-card__body) {
  padding: 10px;
}
</style>
