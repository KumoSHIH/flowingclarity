import { Card, Flex, Stack, Text } from '@sanity/ui'
import { useId } from 'react'
import type { InputProps } from 'sanity'
import { formatCharacterCount, formatCharacterHint, getCharacterLimits } from './characterLimits'

export function CharacterCountInput(props: InputProps) {
  const hintId = useId()
  const limits = getCharacterLimits(props.schemaType)

  if (!limits) return props.renderDefault(props)

  const count = typeof props.value === 'string' ? props.value.length : 0
  const upperLimit = limits.exact ?? limits.max
  const isOverLimit = upperLimit !== undefined && count > upperLimit
  const existingDescription = 'elementProps' in props
    ? props.elementProps['aria-describedby']
    : undefined
  const describedBy = [existingDescription, hintId].filter(Boolean).join(' ')
  const renderProps = 'elementProps' in props
    ? {
        ...props,
        elementProps: {
          ...props.elementProps,
          'aria-describedby': describedBy,
        },
      } as InputProps
    : props

  return (
    <Stack gap={2}>
      <Flex align="center" gap={3} justify="space-between" wrap="wrap">
        <Text id={hintId} muted size={1}>
          {formatCharacterHint(limits)}
        </Text>
        <Card flex="none" padding={1} radius={2} tone={isOverLimit ? 'critical' : 'inherit'}>
          <Text size={1} weight="medium">
            {formatCharacterCount(props.value, limits)}
          </Text>
        </Card>
      </Flex>
      {props.renderDefault(renderProps)}
    </Stack>
  )
}
