import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import QueryBuilder from '../QueryBuilder.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { FilterType, Operator, OperatorText } from '@/types/querybuilder'
import type { QueryBuilderFilter, QueryBuilderGroup, QueryBuilderRule } from '@/types/querybuilder'

describe('QueryBuilder.vue', () => {
  const filters: QueryBuilderFilter[] = [
    {
      field: 'name',
      label: 'Name',
      type: FilterType.STRING,
    },
    {
      field: 'age',
      label: 'Age',
      type: FilterType.NUMBER,
    },
  ]

  const createWrapper = () => {
    return mount(QueryBuilder, {
      props: {
        modelValue: {
          condition: 'AND',
          rules: [],
        } as QueryBuilderGroup,
        filters,
      },
      global: {
        plugins: [ElementPlus],
      },
      attachTo: document.body,
    })
  }

  it('mounts properly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('switches condition', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const switchEl = wrapper.find('.el-switch')
    await switchEl.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    expect(value.condition).toBe('OR')
  })

  it('adds a rule', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    expect(value.rules).toHaveLength(1)
  })

  it('removes a rule', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()
    const removeBtn = wrapper.find('[data-test="remove-rule"]')
    await removeBtn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[1][0] as QueryBuilderGroup
    expect(value.rules).toHaveLength(0)
  })

  it('adds a group', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addGroupBtn = wrapper.find('[data-test="add-group"]')
    await addGroupBtn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderGroup
    expect(firstRule.condition).toBe('AND')
  })

  it('selects a field', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const select = wrapper.find('[data-test="field-select"]')
    await select.trigger('click')
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100)) // Wait for dropdown to show
    const options = wrapper.findAll('.el-select-dropdown__item')
    const nameOption = options.find((option) => option.text() === 'Name')
    await nameOption?.trigger('click')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const emittedArray = emitted as unknown[][]
    const value = emittedArray[emittedArray.length - 1][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderRule
    expect(firstRule.field).toBe('name')
  })

  it('selects an operator', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const select = wrapper.find('[data-test="operator-select"]')
    await select.trigger('click')
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100)) // Wait for dropdown to show
    const options = wrapper.findAll('.el-select-dropdown__item')
    const equalOption = options.find((option) => option.text() === OperatorText[Operator.EQUAL])
    await equalOption?.trigger('click')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const emittedArray = emitted as unknown[][]
    const value = emittedArray[emittedArray.length - 1][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderRule
    expect(firstRule.operator).toBe(Operator.EQUAL)
  })

  it('inputs a value', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const input = wrapper.find('[data-test="value-input"]')
    await input.setValue('test')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const emittedArray = emitted as unknown[][]
    const value = emittedArray[emittedArray.length - 1][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderRule
    expect(firstRule.value).toBe('test')
  })

  it('adds a new rule', async () => {
    const wrapper = createWrapper()
    await nextTick()

    const addButton = wrapper.find('[data-test="add-rule"]')
    await addButton.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    expect(newValue.rules.length).toBe(1)
    const rule = newValue.rules[0] as QueryBuilderRule
    expect(rule.field).toBe('name')
  })

  it('adds a new group', async () => {
    const wrapper = createWrapper()
    await nextTick()

    const addGroupButton = wrapper.find('[data-test="add-group"]')
    await addGroupButton.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    expect(newValue.rules.length).toBe(1)
    const group = newValue.rules[0] as QueryBuilderGroup
    expect(group.condition).toBeTruthy()
    expect(group.rules).toBeTruthy()
  })

  it('changes field and updates operators', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const select = wrapper.findComponent({ name: 'ElSelect' })
    await select.setValue('age')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    if (!emitted) return
    const lastEmitted = emitted[emitted.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(rule.field).toBe('age')
  })

  it('changes operator', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    // Tìm operator select bằng class
    const selects = wrapper.findAllComponents({ name: 'ElSelect' })
    const operatorSelect = selects[1] // Select thứ 2 là operator select
    await operatorSelect.setValue(Operator.CONTAINS)
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    if (!emitted) return
    const lastEmitted = emitted[emitted.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(rule.operator).toBe(Operator.CONTAINS)
  })

  it('handles different input types correctly', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const input = wrapper.find('[data-test="value-input"]')
    await input.setValue('active')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    const rule = newValue.rules[0] as QueryBuilderRule
    expect(rule.value).toBe('active')
  })

  it('handles nested groups correctly', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addGroupBtn = wrapper.find('[data-test="add-group"]')
    await addGroupBtn.trigger('click')
    await nextTick()

    // Add a rule to the nested group
    const nestedAddButton = wrapper.findAll('[data-test="add-rule"]')[1]
    await nestedAddButton.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    const nestedGroup = newValue.rules[0] as QueryBuilderGroup
    expect(nestedGroup.rules.length).toBe(1)
  })
})
