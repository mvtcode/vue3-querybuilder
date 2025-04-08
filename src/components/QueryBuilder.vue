<template>
  <div class="query-builder" data-test="query-builder">
    <el-card>
      <div class="group">
        <div class="group-header">
          <div class="condition-switch">
            <el-switch
              v-model="isAndCondition"
              active-text="AND"
              inactive-text="OR"
              @change="onConditionChange"
              data-test="condition-switch"
            />
          </div>
          <el-button
            type="primary"
            :icon="Plus"
            @click="addRule"
            :disabled="!canAddRule"
            data-test="add-rule"
          >
            Add Rule
          </el-button>
          <el-button type="primary" :icon="FolderAdd" @click="addGroup" data-test="add-group">
            Add Group
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            v-if="!isRoot"
            @click="removeGroup"
            data-test="remove-group"
          >
            Remove Group
          </el-button>
        </div>
        <div class="rules">
          <div
            v-for="(rule, index) in group.rules"
            :key="index"
            class="rule"
            :data-test="'rule-' + index"
          >
            <template v-if="isGroup(rule)">
              <QueryBuilder
                v-model="group.rules[index]"
                :filters="filters"
                :is-root="false"
                @remove="removeRule(index)"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData: any">
                  <slot :name="name" v-bind="slotData" />
                </template>
              </QueryBuilder>
            </template>
            <template v-else>
              <div class="rule-container">
                <el-select
                  v-model="rule.field"
                  class="field-select"
                  @change="onFieldChange(rule)"
                  data-test="field-select"
                >
                  <el-option
                    v-for="filter in getAvailableFilters(rule.field)"
                    :key="filter.field"
                    :label="filter.label"
                    :value="filter.field"
                    :data-test="`${filter.field}-option`"
                  />
                </el-select>
                <el-select
                  v-model="rule.operator"
                  class="operator-select"
                  data-test="operator-select"
                >
                  <el-option
                    v-for="operator in getOperators(rule.field)"
                    :key="operator"
                    :label="OperatorText[operator]"
                    :value="operator"
                    :data-test="`${operator}-option`"
                  />
                </el-select>
                <template v-if="$slots[rule.field]">
                  <slot
                    :name="rule.field"
                    :operator="rule.operator"
                    :value="rule.value"
                    :onChange="(val: unknown) => updateRuleValue(rule, val)"
                  />
                </template>
                <template v-else>
                  <component
                    :is="getInputComponent(rule.field)"
                    v-model="rule.value"
                    v-bind="getInputProps(rule.field)"
                    class="value-input"
                    placeholder="Please input"
                    data-test="value-input"
                    @update:modelValue="(val: unknown) => updateRuleValue(rule, val)"
                  >
                    <template v-if="getFilter(rule.field)?.input === 'select'">
                      <el-option
                        v-for="option in getFilter(rule.field)?.values"
                        :key="option.value"
                        :label="option.text"
                        :value="option.value"
                      />
                    </template>
                  </component>
                </template>
                <el-button
                  type="danger"
                  :icon="Delete"
                  @click="removeRule(index)"
                  data-test="remove-rule"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, FolderAdd, Delete } from '@element-plus/icons-vue'
import type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter } from '../types/querybuilder'
import { Operator, OperatorText, FilterType } from '../types/querybuilder'

interface Props {
  modelValue: QueryBuilderGroup | QueryBuilderRule
  filters: QueryBuilderFilter[]
  isRoot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: QueryBuilderGroup | QueryBuilderRule]
  remove: []
}>()

const group = computed({
  get: () => props.modelValue as QueryBuilderGroup,
  set: (value) => emit('update:modelValue', value),
})

const isAndCondition = computed({
  get: () => group.value.condition === 'AND',
  set: (value) => {
    group.value.condition = value ? 'AND' : 'OR'
  },
})

const onConditionChange = (value: boolean) => {
  group.value.condition = value ? 'AND' : 'OR'
  emit('update:modelValue', group.value)
}

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

const getFilter = (field: string) => {
  return props.filters.find((f) => f.field === field)
}

const getFieldOccurrences = (field: string): number => {
  return group.value.rules.filter((rule) => !isGroup(rule) && rule.field === field).length
}

const getAvailableFilters = (currentField: string): QueryBuilderFilter[] => {
  return props.filters.filter((filter) => {
    const occurrences = getFieldOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return filter.field === currentField || occurrences < maxOccurrences
  })
}

const canAddRule = computed(() => {
  // Kiểm tra xem có ít nhất một filter có thể thêm không
  return props.filters.some((filter) => {
    const occurrences = getFieldOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })
})

const getOperators = (field: string): Operator[] => {
  const filter = getFilter(field)
  if (filter?.operators) {
    return filter.operators
  }

  // Trả về operators mặc định dựa trên type của field
  switch (filter?.type) {
    case FilterType.STRING:
      return [
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
      ]
    case FilterType.NUMBER:
    case FilterType.INTEGER:
      return [
        Operator.EQUAL,
        Operator.NOT_EQUAL,
        Operator.GREATER,
        Operator.GREATER_OR_EQUAL,
        Operator.LESS,
        Operator.LESS_OR_EQUAL,
        Operator.BETWEEN,
        Operator.NOT_BETWEEN,
        Operator.IN,
        Operator.NOT_IN,
      ]
    case FilterType.DATE:
      return [
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
      ]
    case FilterType.BOOLEAN:
      return [Operator.EQUAL, Operator.NOT_EQUAL]
    default:
      return [Operator.EQUAL, Operator.NOT_EQUAL]
  }
}

const getInputComponent = (field: string) => {
  const filter = getFilter(field)
  switch (filter?.type) {
    case FilterType.DATE:
      return 'el-date-picker'
    case FilterType.NUMBER:
    case FilterType.INTEGER:
      return 'el-input-number'
    case FilterType.BOOLEAN:
      return 'el-switch'
    default:
      return filter?.input === 'select' ? 'el-select' : 'el-input'
  }
}

const getInputProps = (field: string) => {
  const filter = getFilter(field)
  const props: Record<string, unknown> = {}

  if (filter?.validation) {
    if (filter.validation.min !== undefined) props.min = filter.validation.min
    if (filter.validation.max !== undefined) props.max = filter.validation.max
    if (filter.validation.step !== undefined) props.step = filter.validation.step
  }

  if (filter?.type === FilterType.DATE) {
    props.type = 'date'
    props.placeholder = 'Pick a date'
    props['value-format'] = filter?.validation?.format || 'YYYY-MM-DD'
    props.format = filter?.validation?.format || 'YYYY-MM-DD'
  }

  if (filter?.input === 'select' && filter.values) {
    props.options = Object.entries(filter.values).map(([value, label]) => ({
      value,
      label,
    }))
  }

  return props
}

const updateRuleValue = (rule: QueryBuilderRule, value: unknown) => {
  rule.value = value
  emit('update:modelValue', group.value)
}

const addRule = () => {
  const availableFilter = props.filters.find((filter) => {
    const occurrences = getFieldOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })

  if (availableFilter) {
    const newRule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: getOperators(availableFilter.field)[0],
      value: null,
    }
    group.value.rules.push(newRule)
    emit('update:modelValue', group.value)
  }
}

const addGroup = () => {
  const newGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [],
  }
  group.value.rules.push(newGroup)
  emit('update:modelValue', group.value)
}

const removeRule = (index: number) => {
  group.value.rules.splice(index, 1)
  emit('update:modelValue', group.value)
}

const removeGroup = () => {
  emit('remove')
}

const onFieldChange = (rule: QueryBuilderRule) => {
  rule.operator = getOperators(rule.field)[0]
  rule.value = null
  emit('update:modelValue', group.value)
}
</script>

<style>
.query-builder {
  margin: 1rem 0;
}

.group {
  padding: 1rem;
}

.group-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.condition-switch {
  display: flex;
  align-items: center;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.field-select,
.operator-select {
  width: 200px;
}

.value-input {
  flex: 1;
}
</style>
