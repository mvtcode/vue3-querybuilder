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
            {{ t('queryBuilder.addRule') }}
          </el-button>
          <el-button
            type="primary"
            :icon="FolderAdd"
            @click="addGroup"
            :disabled="!canAddGroup"
            data-test="add-group"
          >
            {{ t('queryBuilder.addGroup') }}
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            v-if="!isRoot"
            @click="removeGroup"
            data-test="remove-group"
          >
            {{ t('queryBuilder.removeGroup') }}
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
                :max-depth="maxDepth"
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
                  @change="onOperatorChange(rule)"
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
                    :modelValue="rule.value"
                    :onUpdate:modelValue="
                      (val: QueryBuilderValue) => updateRuleValue(rule, val, index)
                    "
                    :isBetween="
                      rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN
                    "
                  />
                </template>
                <template v-else>
                  <template
                    v-if="
                      rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN
                    "
                  >
                    <div class="between-inputs" data-test="between-inputs">
                      <template
                        v-if="
                          getFilter(rule.field)?.type === FilterType.NUMBER ||
                          getFilter(rule.field)?.type === FilterType.INTEGER
                        "
                      >
                        <el-input-number
                          v-model="(rule.value as number[])[0]"
                          :controls="false"
                          :placeholder="t('queryBuilder.from')"
                          @update:modelValue="(val: number) => updateRuleValue(rule, val, 0)"
                          data-test="value-input-from"
                        />
                        <span>{{ t('queryBuilder.and') }}</span>
                        <el-input-number
                          v-model="(rule.value as number[])[1]"
                          :controls="false"
                          :placeholder="t('queryBuilder.to')"
                          @update:modelValue="(val: number) => updateRuleValue(rule, val, 1)"
                          data-test="value-input-to"
                        />
                      </template>
                      <template v-else-if="getFilter(rule.field)?.type === FilterType.DATE">
                        <el-date-picker
                          v-model="(rule.value as Date[])[0]"
                          type="date"
                          :placeholder="t('queryBuilder.from')"
                          @update:modelValue="(val: Date) => updateRuleValue(rule, val, 0)"
                          data-test="value-input-from"
                        />
                        <span>{{ t('queryBuilder.and') }}</span>
                        <el-date-picker
                          v-model="(rule.value as Date[])[1]"
                          type="date"
                          :placeholder="t('queryBuilder.to')"
                          @update:modelValue="(val: Date) => updateRuleValue(rule, val, 1)"
                          data-test="value-input-to"
                        />
                      </template>
                      <template v-else>
                        <el-input
                          v-model="(rule.value as string[])[0]"
                          :placeholder="t('queryBuilder.from')"
                          @update:modelValue="(val: string) => updateRuleValue(rule, val, 0)"
                          data-test="value-input-from"
                        />
                        <span>{{ t('queryBuilder.and') }}</span>
                        <el-input
                          v-model="(rule.value as string[])[1]"
                          :placeholder="t('queryBuilder.to')"
                          @update:modelValue="(val: string) => updateRuleValue(rule, val, 1)"
                          data-test="value-input-to"
                        />
                      </template>
                      <div v-if="rule.error" class="error-message">{{ rule.error }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <component
                      :is="getInputComponent(rule.field)"
                      v-model="rule.value"
                      v-bind="getInputProps(rule.field)"
                      class="value-input"
                      placeholder="Please input"
                      data-test="value-input"
                      @update:modelValue="
                        (val: QueryBuilderValue) => updateRuleValue(rule, val, index)
                      "
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
import { computed, watch } from 'vue'
import { Plus, FolderAdd, Delete } from '@element-plus/icons-vue'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { Operator, OperatorText, FilterType } from '../types/querybuilder'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: QueryBuilderGroup | QueryBuilderRule
  filters: QueryBuilderFilter[]
  isRoot?: boolean
  language?: string
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
  language: 'vi',
  maxDepth: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: QueryBuilderGroup | QueryBuilderRule]
  remove: []
}>()

const { t, locale } = useI18n()

// Set language from prop
watch(
  () => props.language,
  (newLang) => {
    locale.value = newLang
  },
  { immediate: true },
)

const group = computed<QueryBuilderGroup>(() => {
  return props.modelValue as QueryBuilderGroup
})

watch(
  () => group.value.rules,
  (rules) => {
    rules.forEach((rule) => {
      if (!isGroup(rule)) {
        if (rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN) {
          if (!Array.isArray(rule.value)) {
            rule.value = [0, 0]
          }
        }
      }
    })
  },
  { deep: true, immediate: true },
)

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

const getOccurrences = (field: string): number => {
  return group.value.rules.filter(
    (rule: QueryBuilderRule | QueryBuilderGroup) => !isGroup(rule) && rule.field === field,
  ).length
}

const getFilter = (field: string): QueryBuilderFilter | undefined => {
  return props.filters.find((filter) => filter.field === field)
}

const getAvailableFilters = (currentField?: string): QueryBuilderFilter[] => {
  return props.filters.filter((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return filter.field === currentField || occurrences < maxOccurrences
  })
}

const canAddRule = computed(() => {
  return props.filters.some((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })
})

const getOperators = (field: string): Operator[] => {
  const filter = getFilter(field)
  return (
    filter?.operators || [
      Operator.EQUAL,
      Operator.NOT_EQUAL,
      Operator.CONTAINS,
      Operator.NOT_CONTAINS,
      Operator.BEGINS_WITH,
      Operator.ENDS_WITH,
    ]
  )
}

const getInputComponent = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return 'el-input'

  switch (filter.type) {
    case FilterType.NUMBER:
    case FilterType.INTEGER:
      return 'el-input-number'
    case FilterType.DATE:
      return 'el-date-picker'
    default:
      return filter.input === 'select' ? 'el-select' : 'el-input'
  }
}

const getInputProps = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return {}

  const props: Record<string, unknown> = {}

  switch (filter.type) {
    case FilterType.NUMBER:
    case FilterType.INTEGER:
      props.controls = false
      break
    case FilterType.DATE:
      props.type = 'date'
      break
  }

  return props
}

const updateRuleValue = (rule: QueryBuilderRule, value: QueryBuilderValue, index?: number) => {
  if (index !== undefined) {
    if (Array.isArray(rule.value)) {
      ;(rule.value as any[])[index] = value
    }
  } else {
    rule.value = value
  }
  emit('update:modelValue', group.value)
}

const addRule = () => {
  const availableFilter = props.filters.find((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })

  if (availableFilter) {
    const operator = getOperators(availableFilter.field)[0]
    const rule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: operator,
      value: operator === Operator.BETWEEN || operator === Operator.NOT_BETWEEN ? [0, 0] : '',
      error: undefined,
    }
    group.value.rules.push(rule)
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
  const operator = getOperators(rule.field)[0]
  rule.operator = operator
  if (operator === Operator.BETWEEN || operator === Operator.NOT_BETWEEN) {
    rule.value = [0, 0]
  } else {
    rule.value = ''
  }
  validateBetweenValue(rule)
  emit('update:modelValue', group.value)
}

const onOperatorChange = (rule: QueryBuilderRule) => {
  if (rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN) {
    rule.value = [null, null]
  } else {
    rule.value = null
  }
  emit('update:modelValue', { ...group.value })
}

const validateBetweenValue = (rule: QueryBuilderRule) => {
  if (!Array.isArray(rule.value)) {
    rule.value = ['' as string | number | boolean | Date, '' as string | number | boolean | Date]
  }

  const filter = getFilter(rule.field)
  const fromValue = (rule.value as (string | number | boolean | Date)[])[0]
  const toValue = (rule.value as (string | number | boolean | Date)[])[1]

  // Validate required
  if (!fromValue || !toValue) {
    rule.error = 'Both values are required'
    return
  }

  // Validate number type
  if (filter?.type === FilterType.NUMBER || filter?.type === FilterType.INTEGER) {
    const min = filter.validation?.min
    const max = filter.validation?.max
    const fromNum = Number(fromValue)
    const toNum = Number(toValue)

    if (min !== undefined && fromNum < min) {
      rule.error = `From value must be greater than or equal to ${min}`
      return
    }

    if (max !== undefined && toNum > max) {
      rule.error = `To value must be less than or equal to ${max}`
      return
    }

    if (fromNum > toNum) {
      rule.error = 'From value must be less than or equal to To value'
      return
    }
  }

  // Validate date type
  if (filter?.type === FilterType.DATE) {
    const format = filter.validation?.format || 'YYYY-MM-DD'
    const fromDate = dayjs(fromValue as string | Date, format)
    const toDate = dayjs(toValue as string | Date, format)

    if (!fromDate.isValid()) {
      rule.error = 'From date is invalid'
      return
    }

    if (!toDate.isValid()) {
      rule.error = 'To date is invalid'
      return
    }

    if (fromDate.isAfter(toDate)) {
      rule.error = 'From date must be before or equal to To date'
      return
    }
  }

  rule.error = undefined
  emit('update:modelValue', group.value)
}

const canAddGroup = computed(() => {
  if (props.maxDepth === 0) return true
  if (props.maxDepth === 1) return false

  // Tính toán độ sâu hiện tại của group
  const calculateDepth = (group: QueryBuilderGroup): number => {
    let maxDepth = 0
    for (const rule of group.rules) {
      if (isGroup(rule)) {
        const depth = calculateDepth(rule)
        maxDepth = Math.max(maxDepth, depth)
      }
    }
    return maxDepth + 1
  }

  const currentDepth = calculateDepth(group.value)
  return currentDepth < props.maxDepth
})
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

.field-select {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}

.operator-select {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

.value-input {
  flex: 1;
}

.between-inputs {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.between-input {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 0.25rem;
}
</style>
