import {
  FilterType,
  QueryBuilderFilter,
  QueryBuilderGroup,
  QueryBuilderRule,
} from '../types/querybuilder'
import { Operator } from '../types/querybuilder'
import dayjs from 'dayjs'

const operatorToSQL = {
  [Operator.EQUAL]: '=',
  [Operator.NOT_EQUAL]: '!=',
  [Operator.CONTAINS]: 'LIKE',
  [Operator.NOT_CONTAINS]: 'NOT LIKE',
  [Operator.BEGINS_WITH]: 'LIKE',
  [Operator.NOT_BEGINS_WITH]: 'NOT LIKE',
  [Operator.ENDS_WITH]: 'LIKE',
  [Operator.NOT_ENDS_WITH]: 'NOT LIKE',
  [Operator.GREATER]: '>',
  [Operator.GREATER_OR_EQUAL]: '>=',
  [Operator.LESS]: '<',
  [Operator.LESS_OR_EQUAL]: '<=',
  [Operator.IN]: 'IN',
  [Operator.NOT_IN]: 'NOT IN',
  [Operator.BETWEEN]: 'BETWEEN',
  [Operator.NOT_BETWEEN]: 'NOT BETWEEN',
  [Operator.IS_EMPTY]: 'IS NULL',
  [Operator.IS_NOT_EMPTY]: 'IS NOT NULL',
}

const operatorToMongo = {
  [Operator.EQUAL]: '$eq',
  [Operator.NOT_EQUAL]: '$ne',
  [Operator.CONTAINS]: '$regex',
  [Operator.NOT_CONTAINS]: '$not',
  [Operator.BEGINS_WITH]: '$regex',
  [Operator.NOT_BEGINS_WITH]: '$not',
  [Operator.ENDS_WITH]: '$regex',
  [Operator.NOT_ENDS_WITH]: '$not',
  [Operator.GREATER]: '$gt',
  [Operator.GREATER_OR_EQUAL]: '$gte',
  [Operator.LESS]: '$lt',
  [Operator.LESS_OR_EQUAL]: '$lte',
  [Operator.IN]: '$in',
  [Operator.NOT_IN]: '$nin',
  [Operator.BETWEEN]: '$and',
  [Operator.NOT_BETWEEN]: '$nor',
  [Operator.IS_EMPTY]: '$exists',
  [Operator.IS_NOT_EMPTY]: '$exists',
}

function escapeSQL(value: any): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return value.toString()
  return `'${value.toString().replace(/'/g, "''")}'`
}

function ruleToSQL(rule: QueryBuilderRule): string {
  const operator = operatorToSQL[rule.operator]

  switch (rule.operator) {
    case Operator.CONTAINS:
    case Operator.NOT_CONTAINS:
      return `${rule.field} ${operator} '%${rule.value}%'`
    case Operator.BEGINS_WITH:
    case Operator.NOT_BEGINS_WITH:
      return `${rule.field} ${operator} '${rule.value}%'`
    case Operator.ENDS_WITH:
    case Operator.NOT_ENDS_WITH:
      return `${rule.field} ${operator} '%${rule.value}'`
    case Operator.IN:
    case Operator.NOT_IN:
      return `${rule.field} ${operator} (${Array.isArray(rule.value) ? rule.value.map(escapeSQL).join(', ') : escapeSQL(rule.value)})`
    case Operator.BETWEEN:
    case Operator.NOT_BETWEEN:
      if (rule.value && Array.isArray(rule.value)) {
        return `${rule.field} ${operator} ${escapeSQL(rule.value[0])} AND ${escapeSQL(rule.value[1])}`
      }
      return ''
    case Operator.IS_EMPTY:
    case Operator.IS_NOT_EMPTY:
      return `${rule.field} ${operator}`
    default:
      return `${rule.field} ${operator} ${escapeSQL(rule.value)}`
  }
}

function ruleToMongo(rule: QueryBuilderRule): Record<string, any> {
  const operator = operatorToMongo[rule.operator]

  switch (rule.operator) {
    case Operator.CONTAINS:
      return { [rule.field]: { [operator]: rule.value, $options: 'i' } }
    case Operator.NOT_CONTAINS:
      return { [rule.field]: { [operator]: { $regex: rule.value, $options: 'i' } } }
    case Operator.BEGINS_WITH:
      return { [rule.field]: { [operator]: `^${rule.value}`, $options: 'i' } }
    case Operator.NOT_BEGINS_WITH:
      return { [rule.field]: { [operator]: { $regex: `^${rule.value}`, $options: 'i' } } }
    case Operator.ENDS_WITH:
      return { [rule.field]: { [operator]: `${rule.value}$`, $options: 'i' } }
    case Operator.NOT_ENDS_WITH:
      return { [rule.field]: { [operator]: { $regex: `${rule.value}$`, $options: 'i' } } }
    case Operator.BETWEEN:
      if (rule.value && Array.isArray(rule.value)) {
        const [from, to] = rule.value as [unknown, unknown]
        return {
          [rule.field]: {
            $gte: from,
            $lte: to,
          },
        }
      }
      return {}
    case Operator.NOT_BETWEEN:
      if (rule.value && Array.isArray(rule.value)) {
        const [from, to] = rule.value as [unknown, unknown]
        return {
          $or: [{ [rule.field]: { $lt: from } }, { [rule.field]: { $gt: to } }],
        }
      }
      return {}
    case Operator.IS_EMPTY:
      return { [rule.field]: { $exists: false } }
    case Operator.IS_NOT_EMPTY:
      return { [rule.field]: { $exists: true } }
    default:
      return { [rule.field]: { [operator]: rule.value } }
  }
}

export function toSQL(group: QueryBuilderGroup): string {
  const condition = group.condition
  const rules = group.rules.map((rule) => {
    if ('condition' in rule) {
      return `(${toSQL(rule as QueryBuilderGroup)})`
    }
    return ruleToSQL(rule as QueryBuilderRule)
  })

  return rules.join(` ${condition} `)
}

export function toMongo(group: QueryBuilderGroup): Record<string, any> {
  const condition = group.condition === 'AND' ? '$and' : '$or'
  const rules = group.rules.map((rule) => {
    if ('condition' in rule) {
      return toMongo(rule as QueryBuilderGroup)
    }
    return ruleToMongo(rule as QueryBuilderRule)
  })

  return { [condition]: rules }
}

function parseValue(value: string): any {
  if (value === 'NULL') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^\d+$/.test(value)) return parseInt(value)
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value)
  return value.replace(/^'|'$/g, '').replace(/''/g, "'")
}

export function fromSQL(sql: string): QueryBuilderGroup {
  // Đơn giản hóa: chỉ xử lý điều kiện AND/OR cơ bản
  const parts = sql.split(/(?: AND | OR )/)
  const condition = sql.includes(' AND ') ? 'AND' : 'OR'

  const rules = parts.map((part) => {
    const [field, op, ...valueParts] = part.trim().split(/\s+/)
    const value = valueParts.join(' ')

    const operator = Object.entries(operatorToSQL).find(
      ([_, sqlOp]) => sqlOp === op,
    )?.[0] as Operator

    if (!operator) {
      throw new Error(`Unsupported operator: ${op}`)
    }

    return {
      id: crypto.randomUUID(),
      field,
      operator,
      value: parseValue(value),
    }
  })

  return {
    condition,
    rules,
  }
}

export function fromMongo(mongo: Record<string, any>): QueryBuilderGroup {
  const condition = '$and' in mongo ? 'AND' : 'OR'
  const rules = []

  const queries = mongo[condition === 'AND' ? '$and' : '$or'] || []

  for (const query of queries) {
    for (const [field, conditions] of Object.entries(query)) {
      if (typeof conditions !== 'object' || !conditions) continue

      const operator = Object.entries(operatorToMongo).find(
        ([_, mongoOp]) => mongoOp in conditions,
      )?.[0] as Operator

      if (!operator) continue

      rules.push({
        id: crypto.randomUUID(),
        field,
        operator,
        value: conditions[operatorToMongo[operator] as keyof typeof conditions],
      })
    }
  }

  return {
    condition,
    rules,
  }
}

const formatValue = (value: unknown): string => {
  if (value === undefined) return 'NULL'
  if (typeof value === 'string') return `'${value}'`
  if (Array.isArray(value)) {
    return `(${value.map(formatValue).join(', ')})`
  }
  return String(value)
}

export const convertToSql = (rule: QueryBuilderRule): string => {
  const { field, operator } = rule
  const value = rule.value as unknown
  const fieldName = `\`${field}\``

  switch (operator) {
    case Operator.EQUAL:
      return `${fieldName} = ${formatValue(value)}`
    case Operator.NOT_EQUAL:
      return `${fieldName} != ${formatValue(value)}`
    case Operator.CONTAINS:
      return `${fieldName} LIKE '%${value as string}%'`
    case Operator.NOT_CONTAINS:
      return `${fieldName} NOT LIKE '%${value as string}%'`
    case Operator.BEGINS_WITH:
      return `${fieldName} LIKE '${value as string}%'`
    case Operator.ENDS_WITH:
      return `${fieldName} LIKE '%${value as string}'`
    case Operator.GREATER:
      return `${fieldName} > ${formatValue(value)}`
    case Operator.GREATER_OR_EQUAL:
      return `${fieldName} >= ${formatValue(value)}`
    case Operator.LESS:
      return `${fieldName} < ${formatValue(value)}`
    case Operator.LESS_OR_EQUAL:
      return `${fieldName} <= ${formatValue(value)}`
    case Operator.IN:
      return `${fieldName} IN ${formatValue(value)}`
    case Operator.NOT_IN:
      return `${fieldName} NOT IN ${formatValue(value)}`
    case Operator.BETWEEN:
      if (Array.isArray(value)) {
        const [from, to] = value as [unknown, unknown]
        return `${fieldName} BETWEEN ${formatValue(from)} AND ${formatValue(to)}`
      }
      return ''
    case Operator.NOT_BETWEEN:
      if (Array.isArray(value)) {
        const [from, to] = value as [unknown, unknown]
        return `${fieldName} NOT BETWEEN ${formatValue(from)} AND ${formatValue(to)}`
      }
      return ''
    case Operator.IS_EMPTY:
      return `${fieldName} IS NULL`
    case Operator.IS_NOT_EMPTY:
      return `${fieldName} IS NOT NULL`
    default:
      return ''
  }
}

export const convertToMongo = (rule: QueryBuilderRule): Record<string, unknown> => {
  const { field, operator } = rule
  const value = rule.value as unknown

  switch (operator) {
    case Operator.EQUAL:
      return { [field]: value }
    case Operator.NOT_EQUAL:
      return { [field]: { $ne: value } }
    case Operator.CONTAINS:
      return { [field]: { $regex: value as string, $options: 'i' } }
    case Operator.NOT_CONTAINS:
      return { [field]: { $not: { $regex: value as string, $options: 'i' } } }
    case Operator.BEGINS_WITH:
      return { [field]: { $regex: `^${value as string}`, $options: 'i' } }
    case Operator.ENDS_WITH:
      return { [field]: { $regex: `${value as string}$`, $options: 'i' } }
    case Operator.GREATER:
      return { [field]: { $gt: value } }
    case Operator.GREATER_OR_EQUAL:
      return { [field]: { $gte: value } }
    case Operator.LESS:
      return { [field]: { $lt: value } }
    case Operator.LESS_OR_EQUAL:
      return { [field]: { $lte: value } }
    case Operator.IN:
      return { [field]: { $in: value as unknown[] } }
    case Operator.NOT_IN:
      return { [field]: { $nin: value as unknown[] } }
    case Operator.BETWEEN:
      if (Array.isArray(value)) {
        const [from, to] = value as [unknown, unknown]
        return {
          [field]: {
            $gte: from,
            $lte: to,
          },
        }
      }
      return {}
    case Operator.NOT_BETWEEN:
      if (Array.isArray(value)) {
        const [from, to] = value as [unknown, unknown]
        return {
          $or: [{ [field]: { $lt: from } }, { [field]: { $gt: to } }],
        }
      }
      return {}
    case Operator.IS_EMPTY:
      return { [field]: { $exists: false } }
    case Operator.IS_NOT_EMPTY:
      return { [field]: { $exists: true } }
    default:
      return {}
  }
}

const toString = (v: any) => `'''${v}'''`

const mapOperator: Record<Operator, string> = {
  [Operator.EQUAL]: '==',
  [Operator.NOT_EQUAL]: '!=',
  [Operator.CONTAINS]: 'LIKE',
  [Operator.NOT_CONTAINS]: 'NLIKE',
  [Operator.BEGINS_WITH]: 'LIKE%',
  [Operator.NOT_BEGINS_WITH]: 'NLIKE%',
  [Operator.ENDS_WITH]: '%LIKE',
  [Operator.NOT_ENDS_WITH]: '%NLIKE',
  [Operator.GREATER]: '>',
  [Operator.GREATER_OR_EQUAL]: '>=',
  [Operator.LESS]: '<',
  [Operator.LESS_OR_EQUAL]: '<=',
  [Operator.IN]: 'IN',
  [Operator.NOT_IN]: 'NIN',
  [Operator.BETWEEN]: 'BETWEEN',
  [Operator.NOT_BETWEEN]: 'NOTBETWEEN',
  [Operator.IS_EMPTY]: 'IS_NULL',
  [Operator.IS_NOT_EMPTY]: 'IS_NOT_NULL',
}

const formatDate = (v: any, format: string) => dayjs(v).format(format)

const toDate = (field: string, v: any, operator: Operator): string => {
  if (dayjs(v).isValid()) {
    const date = formatDate(v, 'YYYY-MM-DD')
    switch (operator) {
      case Operator.LESS_OR_EQUAL:
        return `{${field}} <= #${date} 23:59:59#`
      case Operator.LESS:
        return `{${field}} < #${date}#`
      case Operator.GREATER:
        return `{${field}} > #${date} 23:59:59#`
      case Operator.GREATER_OR_EQUAL:
        return `{${field}} >= #${date}#`
      case Operator.NOT_EQUAL:
        return `({${field}} < #${date}# OR {${field}} > #${date} 23:59:59#)`
      default:
        return `({${field}} >= #${date}# AND {${field}} <= #${date} 23:59:59#)`
    }
  } else if (v.length === 2) {
    const date1 = formatDate(v[0], 'YYYY-MM-DD')
    const date2 = formatDate(v[1], 'YYYY-MM-DD')
    switch (operator) {
      case Operator.BETWEEN:
        return `({${field}} >= #${date1}# AND {${field}} <= #${date2} 23:59:59#)`
      case Operator.NOT_BETWEEN:
        return `({${field}} < #${date1}# OR {${field}} > #${date2} 23:59:59#)`
      default:
        return ''
    }
  }

  return ''
}

const toDateRange = (field: string, v: Date[], operator: Operator) => {
  if (v.length < 2) return ''

  switch (operator) {
    case Operator.BETWEEN:
      return `({${field}} >= #${formatDate(v[0], 'YYYY-MM-DD')}# AND {${field}} <= #${formatDate(v[1], 'YYYY-MM-DD')} 23:59:59#)`
    case Operator.NOT_BETWEEN:
      return `({${field}} < #${formatDate(v[0], 'YYYY-MM-DD')}# OR {${field}} > #${formatDate(v[1], 'YYYY-MM-DD')} 23:59:59#)`
    default:
      return ''
  }
}

export const convertToMnpQuery = (
  group: QueryBuilderGroup,
  filters: QueryBuilderFilter[],
): string => {
  const mapFieldDataType: Record<string, FilterType> = filters.reduce(
    (map, filter) => {
      map[filter.field] = filter.type
      return map
    },
    {} as Record<string, FilterType>,
  )

  const results: string[] = []
  const condition = group.condition

  for (const rule of group.rules) {
    if ('condition' in rule) {
      results.push(`(${convertToMnpQuery(rule as QueryBuilderGroup, filters)})`)
    } else {
      const field = rule.field
      const operator = rule.operator
      const value = rule.value
      const dataType = mapFieldDataType[field]
      const operatorMnp = mapOperator[operator]

      if (
        typeof value === 'undefined' &&
        ![Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(operator)
      )
        continue

      if ([Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(operator)) {
        results.push(`{${field}} ${operatorMnp}`)
        continue
      }

      switch (dataType) {
        case FilterType.STRING:
        case FilterType.EMAIL:
          if (Array.isArray(value)) {
            value.length &&
              results.push(`{${field}} ${operatorMnp} ['''${value?.join("''', '''")}''']`)
          } else {
            results.push(`{${field}} ${operatorMnp} ${toString(value)}`)
          }
          break
        case FilterType.BOOLEAN:
          results.push(`{${field}} ${operatorMnp} ${value}`)
          break
        case FilterType.INTEGER:
        case FilterType.NUMBER:
          switch (operator) {
            case Operator.IN:
            case Operator.NOT_IN:
              results.push(`{${field}} ${operatorMnp} [${(value as number[])?.join(', ')}]`)
              break
            case Operator.BETWEEN:
            case Operator.NOT_BETWEEN:
              if (Array.isArray(value) && !value.includes(undefined)) {
                results.push(
                  `{${field}} ${operatorMnp} [${(value as number[])?.[0]}, ${(value as number[])?.[1]}]`,
                )
              }
              break
            default:
              results.push(`{${field}} ${operatorMnp} ${value}`)
          }
          break
        case FilterType.DATE:
          switch (operator) {
            case Operator.BETWEEN:
            case Operator.NOT_BETWEEN:
              if (Array.isArray(value) && !value.includes(undefined)) {
                results.push(toDateRange(field, value as Date[], operator))
              }
              break
            default:
              results.push(toDate(field, value, operator))
          }
          break
        // case FilterType.TIME:
        //   if (Array.isArray(value)) {
        //     value.length &&
        //       results.push(
        //         `({${field}} ${operatorMnp} #${dayjs(value[0] as Date).format('YYYY-MM-DD')}# AND #${dayjs(value[1] as Date).format('YYYY-MM-DD')}#)`,
        //       )
        //   } else {
        //     results.push(`{${field}} ${operatorMnp} #${dayjs(value as Date).format('YYYY-MM-DD')}#`)
        //   }
        //   break
        case FilterType.DATETIME:
          switch (operator) {
            case Operator.BETWEEN:
            case Operator.NOT_BETWEEN:
              if (Array.isArray(value) && !value.includes(undefined)) {
                results.push(
                  `({${field}} ${operatorMnp} [#${formatDate(value[0] as Date, 'YYYY-MM-DD HH:mm:ss')}#, #${formatDate(value[1] as Date, 'YYYY-MM-DD HH:mm:ss')}#]`,
                )
              }
              break
            default:
              results.push(
                `{${field}} ${operatorMnp} #${dayjs(value as Date).format('YYYY-MM-DD HH:mm:ss')}#`,
              )
          }
          break
        default:
          results.push(`{${field}} ${operatorMnp}`)
      }
    }
  }

  return results.join(` ${condition} `)
}
