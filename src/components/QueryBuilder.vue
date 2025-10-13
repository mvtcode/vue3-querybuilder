<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="query-builder" data-test="query-builder">
    <el-card shadow="never">
      <div class="group">
        <!-- group header -->
        <div class="group-header">
          <div class="group-header-left">
            <div class="condition-switch">
              <el-switch
                v-model="isAndCondition"
                :active-text="labelAnd"
                :inactive-text="labelOr"
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
              plain
            >
              {{ labelAddRule }}
            </el-button>
            <el-button
              type="primary"
              :icon="FolderAdd"
              @click="addGroup"
              :disabled="!canAddGroup"
              data-test="add-group"
              plain
            >
              {{ labelAddGroup }}
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              v-if="!isRoot"
              @click="removeGroup"
              data-test="remove-group"
              plain
            >
              {{ labelRemoveGroup }}
            </el-button>
          </div>
          <div class="group-header-right">
            <div v-show="isRoot">(version: {{ packageJson.version }})</div>
          </div>
        </div>
        <!-- end group header -->

        <!-- rules -->
        <div class="rules">
          <div
            v-for="(rule, index) in group.rules"
            :key="index"
            class="rule"
            :data-test="'rule-' + index"
          >
            <!-- Group rule -->
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
            <!-- end Group rule -->

            <!-- Rule -->
            <template v-else>
              <div class="rule-container">
                <!-- Field select -->
                <el-select
                  v-model="rule.field"
                  class="field-select"
                  @change="onFieldChange(rule)"
                  data-test="field-select"
                  :style="{ width: `${widthFieldSelect}px` }"
                >
                  <el-option
                    v-for="filter in getAvailableFilters(rule.field)"
                    :key="filter.field"
                    :label="filter.label"
                    :value="filter.field"
                    :data-test="`${filter.field}-option`"
                  />
                </el-select>
                <!-- end Field select -->
                <!-- Operator select -->
                <el-select
                  v-model="rule.operator"
                  @change="onOperatorChange(rule)"
                  class="operator-select"
                  data-test="operator-select"
                  :style="{ width: `${widthOperatorSelect}px` }"
                >
                  <el-option
                    v-for="operator in getOperators(rule.field)"
                    :key="operator"
                    :label="OperatorText[operator]"
                    :value="operator"
                    :data-test="`${operator}-option`"
                  />
                </el-select>
                <!-- end Operator select -->
                <!-- Value input -->
                <slot
                  :name="rule.field"
                  :operator="rule.operator"
                  :value="rule.value"
                  :isBetween="[Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)"
                  :rule="rule"
                  :index="index"
                  :widthValueInput="widthValueInput"
                >
                  <!-- todo: implement default input each data type -->
                  <el-input
                    v-model="rule.value"
                    :style="{ width: `${widthValueInput}px` }"
                    :placeholder="labelEnterValue"
                    @update:modelValue="
                      (val: QueryBuilderValue) => updateRuleValue(rule, val, index)
                    "
                  />
                  <!-- todo: end implement default input each data type -->
                </slot>
                <!-- end Value input -->
                <!-- Remove rule -->
                <el-button
                  type="danger"
                  :icon="Delete"
                  @click="removeRule(index)"
                  data-test="remove-rule"
                  plain
                  circle
                />
                <!-- end Remove rule -->
              </div>
            </template>
            <!-- end Rule -->
          </div>
        </div>
        <!-- end rules -->
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
import { Operator, OperatorText } from '../types/querybuilder'
import packageJson from '../../package.json'

interface Props {
  modelValue: QueryBuilderGroup | QueryBuilderRule
  filters: QueryBuilderFilter[]
  isRoot?: boolean
  maxDepth?: number
  labelAddRule?: string
  labelAddGroup?: string
  labelRemoveGroup?: string
  labelFrom?: string
  labelTo?: string
  labelAnd?: string
  labelOr?: string
  labelSelectField?: string
  labelSelectOperator?: string
  labelEnterValue?: string
  labelRemoveRule?: string
  labelCondition?: string
  widthFieldSelect?: number
  widthOperatorSelect?: number
  widthValueInput?: number
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
  labelAddRule: 'Add Rule',
  labelAddGroup: 'Add Group',
  labelRemoveGroup: 'Remove Group',
  labelFrom: 'From',
  labelTo: 'To',
  labelAnd: 'And',
  labelOr: 'Or',
  labelSelectField: 'Select Field',
  labelSelectOperator: 'Select Operator',
  labelEnterValue: 'Enter Value',
  labelRemoveRule: 'Remove Rule',
  labelCondition: 'Condition',
  widthFieldSelect: 200,
  widthOperatorSelect: 180,
  widthValueInput: 250,
  maxDepth: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: QueryBuilderGroup | QueryBuilderRule): void
  (e: 'remove'): void
}>()

// Map để lưu trữ operator trước đó của mỗi rule
const previousOperators = new Map<string, Operator>()

const group = computed<QueryBuilderGroup>(() => {
  return props.modelValue as QueryBuilderGroup
})

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

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

const onFieldChange = (rule: QueryBuilderRule) => {
  rule.operator = getOperators(rule.field)[0]
  if ([Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)) {
    rule.value = [undefined, undefined]
  } else {
    rule.value = undefined
  }
  emit('update:modelValue', group.value)
}

const onOperatorChange = (rule: QueryBuilderRule) => {
  // Lấy operator trước đó từ Map
  const previousOperator = previousOperators.get(rule.id)

  // Kiểm tra xem có sự chuyển đổi giữa các group không
  const isBetweenGroup = [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)
  const wasBetweenGroup = previousOperator
    ? [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(previousOperator)
    : false

  // Chỉ reset value khi có sự chuyển đổi giữa các group khác nhau
  if (isBetweenGroup !== wasBetweenGroup) {
    if (isBetweenGroup) {
      rule.value = [undefined, undefined]
    } else {
      rule.value = undefined
    }
  }

  // Lưu operator hiện tại làm previous cho lần sau
  previousOperators.set(rule.id, rule.operator)

  emit('update:modelValue', { ...group.value })
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
  return filter?.operators || [Operator.EQUAL]
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
    let defaultValue: QueryBuilderValue

    if ([Operator.BETWEEN, Operator.NOT_BETWEEN].includes(operator)) {
      defaultValue = [undefined, undefined]
    } else {
      defaultValue = availableFilter.value !== undefined ? availableFilter.value : undefined
    }

    const rule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: operator,
      value: defaultValue,
      error: undefined,
    }

    // Khởi tạo previous operator cho rule mới
    previousOperators.set(rule.id, operator)

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
  const rule = group.value.rules[index]
  if (!isGroup(rule)) {
    // Xóa previous operator khỏi Map
    previousOperators.delete(rule.id)
  }
  group.value.rules.splice(index, 1)
  emit('update:modelValue', group.value)
}

const removeGroup = () => {
  emit('remove')
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

<style scoped>
.query-builder {
  margin: 0;
}

.group {
  padding: 0;
}

.group-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.group-header-left {
  display: flex;
  gap: 1rem;
}

.group-header-right {
  display: flex;
  gap: 1rem;
  margin-left: auto;
  color: #999;
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
