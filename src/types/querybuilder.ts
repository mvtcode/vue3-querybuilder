export enum FilterType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum Operator {
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  BEGINS_WITH = 'begins_with',
  NOT_BEGINS_WITH = 'not_begins_with',
  ENDS_WITH = 'ends_with',
  NOT_ENDS_WITH = 'not_ends_with',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  GREATER = 'greater',
  GREATER_OR_EQUAL = 'greater_or_equal',
  LESS = 'less',
  LESS_OR_EQUAL = 'less_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',
}

export const OperatorText: Record<Operator, string> = {
  [Operator.EQUAL]: '=',
  [Operator.NOT_EQUAL]: '≠',
  [Operator.CONTAINS]: 'Có chứa',
  [Operator.NOT_CONTAINS]: 'Không có chứa',
  [Operator.BEGINS_WITH]: 'Bắt đầu bằng',
  [Operator.NOT_BEGINS_WITH]: 'Không bắt đầu bằng',
  [Operator.ENDS_WITH]: 'Kết thúc bằng',
  [Operator.NOT_ENDS_WITH]: 'Không kết thúc bằng',
  [Operator.IS_EMPTY]: 'Rỗng',
  [Operator.IS_NOT_EMPTY]: 'Không rỗng',
  [Operator.GREATER]: '>',
  [Operator.GREATER_OR_EQUAL]: '≥',
  [Operator.LESS]: '<',
  [Operator.LESS_OR_EQUAL]: '≤',
  [Operator.IN]: 'IN',
  [Operator.NOT_IN]: 'NOT IN',
  [Operator.BETWEEN]: 'BETWEEN',
  [Operator.NOT_BETWEEN]: 'NOT BETWEEN',
}

export type QueryBuilderValue =
  | string
  | number
  | boolean
  | Date
  | null
  | (string | number | boolean | Date | null)[]

export interface QueryBuilderRule {
  id: string
  field: string
  operator: Operator
  value: QueryBuilderValue
  error?: string
}

export interface QueryBuilderGroup {
  condition: 'AND' | 'OR'
  rules: (QueryBuilderRule | QueryBuilderGroup)[]
}

export interface QueryBuilderFilter {
  field: string
  label: string
  type: FilterType
  operators?: Operator[]
  input?: 'text' | 'select' | 'date' | 'radio' | 'number'
  values?: { value: string | number | boolean; text: string }[]
  maxOccurrences?: number
  validation?: {
    min?: number
    max?: number
    format?: string
  }
}

export interface QueryBuilderOptions {
  filters: QueryBuilderFilter[]
  defaultFilter?: string
  defaultOperator?: Operator
  defaultCondition?: 'AND' | 'OR'
  allowGroups?: boolean
  allowEmpty?: boolean
  plugins?: string[]
  icons?: {
    addGroup?: string
    addRule?: string
    removeGroup?: string
    removeRule?: string
  }
}
