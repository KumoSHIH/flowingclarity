import type { InputProps } from 'sanity'

type RuleSpecLike = {
  constraint?: unknown
  flag?: string
}

type ValidationRuleLike = {
  _rules?: RuleSpecLike[]
}

export type CharacterLimits = {
  exact?: number
  max?: number
  min?: number
}

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

const isCharacterCountedType = (schemaType: InputProps['schemaType']) => (
  schemaType.name === 'string' || schemaType.name === 'text'
)

export const getCharacterLimits = (schemaType: InputProps['schemaType']): CharacterLimits | undefined => {
  if (!isCharacterCountedType(schemaType)) return undefined

  const limits: CharacterLimits = {}
  const validation = Array.isArray(schemaType.validation)
    ? schemaType.validation as ValidationRuleLike[]
    : []

  for (const rule of validation) {
    for (const spec of rule._rules ?? []) {
      if (!isFiniteNumber(spec.constraint)) continue
      if (spec.flag === 'length') limits.exact = spec.constraint
      if (spec.flag === 'min') limits.min = spec.constraint
      if (spec.flag === 'max') limits.max = spec.constraint
    }
  }

  return limits.exact === undefined && limits.min === undefined && limits.max === undefined
    ? undefined
    : limits
}

export const formatCharacterHint = ({ exact, max, min }: CharacterLimits) => {
  if (exact !== undefined) return `請輸入 ${exact} 字。`
  if (min !== undefined && max !== undefined) return `請輸入 ${min}–${max} 字。`
  if (min !== undefined) return `至少輸入 ${min} 字。`
  return `最多輸入 ${max} 字。`
}

export const formatCharacterCount = (value: unknown, limits: CharacterLimits) => {
  const count = typeof value === 'string' ? value.length : 0
  const upperLimit = limits.exact ?? limits.max
  return upperLimit === undefined ? `目前 ${count} 字` : `${count}/${upperLimit}`
}
