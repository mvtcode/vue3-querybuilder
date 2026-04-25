export enum FilterType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  DATE = 'date',
  // TIME = 'time',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
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
  // IS_NULL = 'is_null',
  // IS_NOT_NULL = 'is_not_null',
}

export const OperatorText: Record<Operator, string> = {
  [Operator.EQUAL]: 'queryBuilder.operators.equal',
  [Operator.NOT_EQUAL]: 'queryBuilder.operators.not_equal',
  [Operator.CONTAINS]: 'queryBuilder.operators.contains',
  [Operator.NOT_CONTAINS]: 'queryBuilder.operators.not_contains',
  [Operator.BEGINS_WITH]: 'queryBuilder.operators.begins_with',
  [Operator.NOT_BEGINS_WITH]: 'queryBuilder.operators.not_begins_with',
  [Operator.ENDS_WITH]: 'queryBuilder.operators.ends_with',
  [Operator.NOT_ENDS_WITH]: 'queryBuilder.operators.not_ends_with',
  [Operator.IS_EMPTY]: 'queryBuilder.operators.is_empty',
  [Operator.IS_NOT_EMPTY]: 'queryBuilder.operators.is_not_empty',
  [Operator.GREATER]: 'queryBuilder.operators.greater',
  [Operator.GREATER_OR_EQUAL]: 'queryBuilder.operators.greater_or_equal',
  [Operator.LESS]: 'queryBuilder.operators.less',
  [Operator.LESS_OR_EQUAL]: 'queryBuilder.operators.less_or_equal',
  [Operator.IN]: 'queryBuilder.operators.in',
  [Operator.NOT_IN]: 'queryBuilder.operators.not_in',
  [Operator.BETWEEN]: 'queryBuilder.operators.between',
  [Operator.NOT_BETWEEN]: 'queryBuilder.operators.not_between',
  // [Operator.IS_NULL]: 'queryBuilder.operators.is_null',
  // [Operator.IS_NOT_NULL]: 'queryBuilder.operators.is_not_null',
}

export type QueryBuilderValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | (string | number | boolean | Date | undefined | null)[]

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
  input?: 'text' | 'select' | 'date' | 'radio' | 'number' | 'email' | 'checkbox'
  value?:
    | string
    | number
    | boolean
    | Date
    | undefined
    | (string | number | boolean | Date | undefined)[]
  values?: { value: string | number | boolean | Date; text: string }[]
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
