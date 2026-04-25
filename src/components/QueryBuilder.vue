<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="query-builder" :class="`size--${size}`" data-test="query-builder">
    <el-card shadow="never">
      <div class="group">
        <!-- group header -->
        <div class="group-header">
          <div class="group-header-left">
            <el-switch
              v-model="isAndCondition"
              class="condition-switch"
              data-test="condition-switch"
              :active-text="t('queryBuilder.and')"
              :inactive-text="t('queryBuilder.or')"
              inline-prompt
              :size="size"
            />
            <el-button
              type="primary"
              plain
              @click="addRule"
              :disabled="!canAddRule"
              data-test="add-rule"
              :size="size"
              :icon="Plus"
            >
              {{ t('queryBuilder.addRule') }}
            </el-button>
            <el-button
              type="primary"
              plain
              @click="addGroup"
              :disabled="!canAddGroup"
              data-test="add-group"
              :size="size"
              :icon="FolderAdd"
            >
              {{ t('queryBuilder.addGroup') }}
            </el-button>
            <el-button
              type="danger"
              plain
              @click="removeGroup"
              v-if="!isRoot"
              data-test="remove-group"
              :size="size"
              :icon="Delete"
            >
              {{ t('queryBuilder.removeGroup') }}
            </el-button>
          </div>
          <!-- <div class="group-header-right">
            <div v-show="isRoot" class="version">(v{{ packageJson.version }})</div>
          </div> -->
        </div>
        <!-- end group header -->

        <!-- rules -->
        <div class="rules">
          <div v-for="(rule, index) in group.rules" :key="index" :data-test="'rule-' + index">
            <!-- Group rule -->
            <template v-if="isGroup(rule)">
              <QueryBuilder
                :model-value="asGroup(group.rules[index])"
                @update:model-value="(val: any) => (group.rules[index] = val as QueryBuilderGroup)"
                :filters="filters"
                :is-root="false"
                :max-depth="maxDepth > 0 ? maxDepth - 1 : 0"
                :current-depth="currentDepth + 1"
                :language="language"
                :width-field-select="widthFieldSelect"
                :width-operator-select="widthOperatorSelect"
                :width-value-input="widthValueInput"
                :size="size"
                @remove="removeRule(index)"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData">
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
                  :style="{ width: `${widthFieldSelect}px` }"
                  :placeholder="t('queryBuilder.selectField')"
                  @change="onRuleFieldChange(rule)"
                  data-test="field-select"
                  :size="size"
                >
                  <el-option
                    v-for="filter in getAvailableFilters(rule.field)"
                    :key="filter.field"
                    :label="filter.label"
                    :value="filter.field"
                  />
                </el-select>
                <!-- end Field select -->

                <!-- Operator select -->
                <el-select
                  v-model="rule.operator"
                  :style="{ width: `${widthOperatorSelect}px` }"
                  :placeholder="t('queryBuilder.selectOperator')"
                  @change="onRuleOperatorChange(rule)"
                  data-test="operator-select"
                  :size="size"
                >
                  <el-option
                    v-for="op in getOperators(rule.field)"
                    :key="op.value"
                    :label="op.label"
                    :value="op.value"
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
                  :size="size"
                  :filter="mapFields[rule.field]"
                  v-if="![Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
                >
                  <el-input
                    v-model="rule.value as any"
                    :style="{ width: `${widthValueInput}px` }"
                    :placeholder="t('queryBuilder.enterValue')"
                    clearable
                    :size="size"
                  />
                </slot>
                <!-- end Value input -->

                <!-- Remove rule -->
                <el-button
                  type="danger"
                  circle
                  plain
                  @click="removeRule(index)"
                  data-test="remove-rule"
                  :size="size"
                  :icon="Delete"
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
import { computed, withDefaults, defineProps, defineEmits, defineModel, watch } from 'vue'
import { Plus, FolderAdd, Delete } from '@element-plus/icons-vue'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { FilterType, Operator, OperatorText } from '../types/querybuilder'
import { createI18n } from 'vue-i18n'
import en from '../i18n/locales/en'
import vi from '../i18n/locales/vi'

interface Props {
  filters: QueryBuilderFilter[]
  isRoot?: boolean
  maxDepth?: number
  currentDepth?: number
  language?: 'vi' | 'en'
  widthFieldSelect?: number
  widthOperatorSelect?: number
  widthValueInput?: number
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
  widthFieldSelect: 200,
  widthOperatorSelect: 180,
  widthValueInput: 250,
  maxDepth: 0,
  currentDepth: 1,
  size: 'default',
  language: 'vi',
})

const i18n = createI18n({
  legacy: false,
  locale: props.language,
  fallbackLocale: 'en',
  messages: {
    en,
    vi,
  },
})

const { t, locale } = i18n.global

watch(
  () => props.language,
  (lang: 'vi' | 'en') => {
    locale.value = (lang || 'vi') as any
  },
  { immediate: true },
)

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'change'): void
}>()

const mapFields = computed(() => {
  return props.filters.reduce(
    (map: Record<string, QueryBuilderFilter>, filter: QueryBuilderFilter) => {
      map[filter.field] = filter
      return map
    },
    {} as Record<string, QueryBuilderFilter>,
  )
})

// Map để lưu trữ operator trước đó của mỗi rule
const previousOperators = new Map<string, Operator>()

const group = defineModel<QueryBuilderGroup>({
  default: {
    condition: 'AND',
    rules: [],
  },
})

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

// Seed previousOperators từ model value
watch(
  () => group.value.rules,
  (rules: (QueryBuilderRule | QueryBuilderGroup)[]) => {
    for (const rule of rules) {
      if (!isGroup(rule) && rule.id && rule.operator && !previousOperators.has(rule.id)) {
        previousOperators.set(rule.id, rule.operator)
      }
    }
  },
  { immediate: true },
)

// Emit 'change' khi bất kỳ thay đổi nào xảy ra trong group
watch(
  () => group.value,
  () => {
    if (props.isRoot) emit('change')
  },
  { deep: true, flush: 'post' },
)

const asGroup = (rule: QueryBuilderRule | QueryBuilderGroup): QueryBuilderGroup => {
  return rule as QueryBuilderGroup
}

const isBetweenOperator = (operator: Operator): boolean => {
  return [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(operator)
}

const isInOperator = (operator: Operator): boolean => {
  return [Operator.IN, Operator.NOT_IN].includes(operator)
}

const getDefaultValue = (rule: QueryBuilderRule): QueryBuilderValue => {
  const filter = mapFields.value[rule.field]
  if (isBetweenOperator(rule.operator)) {
    switch (filter?.type) {
      case FilterType.DATE:
      case FilterType.DATETIME:
        return null
      default:
        return []
    }
  } else if (isInOperator(rule.operator)) {
    return []
  } else {
    if (filter?.value !== undefined) {
      return filter.value
    } else {
      switch (filter?.type) {
        case FilterType.INTEGER:
        case FilterType.NUMBER:
          return 0
        case FilterType.STRING:
        case FilterType.EMAIL:
          return undefined
        case FilterType.BOOLEAN:
          return false
        case FilterType.DATE:
        case FilterType.DATETIME:
          return undefined
        default:
          return undefined
      }
    }
  }
}

const isAndCondition = computed({
  get: (): boolean => group.value.condition === 'AND',
  set: (value: boolean) => {
    group.value.condition = value ? 'AND' : 'OR'
  },
})

const onRuleFieldChange = (rule: QueryBuilderRule) => {
  rule.operator = getOperators.value(rule.field)[0].value
  rule.value = getDefaultValue(rule)
}

const onRuleOperatorChange = (rule: QueryBuilderRule) => {
  const previousOperator = previousOperators.get(rule.id)
  const isBetweenGroup = [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)
  const wasBetweenGroup = previousOperator
    ? [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(previousOperator)
    : false
  const isInGroup = [Operator.IN, Operator.NOT_IN].includes(rule.operator)
  const wasInGroup = previousOperator
    ? [Operator.IN, Operator.NOT_IN].includes(previousOperator)
    : false

  if (isBetweenGroup !== wasBetweenGroup || isInGroup !== wasInGroup) {
    rule.value = getDefaultValue(rule)
  }
  previousOperators.set(rule.id, rule.operator)
}

const getOccurrences = (field: string): number => {
  return group.value.rules.filter(
    (rule: QueryBuilderRule | QueryBuilderGroup) => !isGroup(rule) && rule.field === field,
  ).length
}

const getAvailableFilters = (currentField?: string): { field: string; label: string }[] => {
  return props.filters
    .filter((filter: QueryBuilderFilter) => {
      const occurrences = getOccurrences(filter.field)
      const maxOccurrences = filter.maxOccurrences || 1
      return filter.field === currentField || occurrences < maxOccurrences
    })
    .map((filter: QueryBuilderFilter) => ({ field: filter.field, label: filter.label }))
}

const canAddRule = computed(() => {
  return props.filters.some((filter: QueryBuilderFilter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })
})

const getOperators = computed(() => {
  return (field: string): { value: Operator; label: string }[] => {
    return (mapFields.value[field]?.operators || [Operator.EQUAL]).map((operator: Operator) => ({
      value: operator,
      label: t(OperatorText[operator]),
    }))
  }
})

const addRule = () => {
  const availableFilter = props.filters.find((filter: QueryBuilderFilter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })

  if (availableFilter) {
    const operator = getOperators.value(availableFilter.field)[0].value
    const rule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: operator,
      value: undefined,
      error: undefined,
    }
    rule.value = getDefaultValue(rule)
    previousOperators.set(rule.id, operator)
    group.value.rules.push(rule)
  }
}

const addGroup = () => {
  const newGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [],
  }
  group.value.rules.push(newGroup)
}

const removeRule = (index: number) => {
  const rule = group.value.rules[index]
  if (!isGroup(rule)) {
    previousOperators.delete(rule.id)
  }
  group.value.rules.splice(index, 1)
}

const removeGroup = () => {
  emit('remove')
}

const canAddGroup = computed(() => {
  if (props.maxDepth === 0) return true
  return props.currentDepth <= props.maxDepth // bắt đầu là 1 nên dùng <=
})
</script>

<style lang="scss" scoped>
.query-builder {
  margin-bottom: 10px;
  &.size--small {
    .group {
      .group-header {
        margin-bottom: 10px;
        .group-header-left {
          gap: 10px;
        }
      }
    }
    .rules {
      gap: 10px;
      .rule-container {
        gap: 10px;
      }
    }
  }
  &.size--default {
    .group {
      .group-header {
        margin-bottom: 12px;
        .group-header-left {
          gap: 12px;
        }
      }
    }
    .rules {
      gap: 12px;
      .rule-container {
        gap: 12px;
      }
    }
  }
  &.size--large {
    .group {
      .group-header {
        margin-bottom: 15px;
        .group-header-left {
          gap: 15px;
        }
      }
    }
    .rules {
      gap: 15px;
      .rule-container {
        gap: 15px;
      }
    }
  }

  .group {
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .group-header-left {
        display: flex;
        align-items: center;
      }
    }

    .rules {
      display: flex;
      flex-direction: column;

      .rule-container {
        display: flex;
        align-items: center;
      }
    }
  }
}

.el-button + .el-button {
  margin-left: 0;
}
</style>
