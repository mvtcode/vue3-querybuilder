import type { DefineComponent } from 'vue'
import type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter } from '../types/querybuilder'

export interface QueryBuilderProps {
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

declare const QueryBuilder: DefineComponent<
  QueryBuilderProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    'update:modelValue': (value: QueryBuilderRule | QueryBuilderGroup) => void
    remove: () => void
  }
>

export default QueryBuilder
