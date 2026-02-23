it('renders a dropdown divider list item containing an hr separator', async () => {
  const wrapper = mount(BDropdownDivider)

  expect(wrapper.element.tagName).toBe('LI')

  const divider = wrapper.find('hr')
  expect(divider.element.tagName).toBe('HR')
  expect(divider.classes()).toContain('dropdown-divider')
  expect(divider.classes().length).toBe(1)
  expect(divider.attributes('role')).toBeDefined()
  expect(divider.attributes('role')).toEqual('separator')
  expect(divider.text()).toEqual('')

  wrapper.destroy()
})