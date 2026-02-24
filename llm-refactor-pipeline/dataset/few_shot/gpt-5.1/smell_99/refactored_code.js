it('renders dropdown divider with correct structure and attributes', async () => {
  const wrapper = mount(BDropdownDivider)

  const assertRootElementIsListItem = () => {
    expect(wrapper.element.tagName).toBe('LI')
  }

  const assertDividerTagAndClass = (divider) => {
    expect(divider.element.tagName).toBe('HR')
    expect(divider.classes()).toContain('dropdown-divider')
    expect(divider.classes().length).toBe(1)
  }

  const assertDividerAccessibilityAndContent = (divider) => {
    expect(divider.attributes('role')).toBeDefined()
    expect(divider.attributes('role')).toEqual('separator')
    expect(divider.text()).toEqual('')
  }

  const divider = wrapper.find('hr')

  assertRootElementIsListItem()
  assertDividerTagAndClass(divider)
  assertDividerAccessibilityAndContent(divider)

  wrapper.destroy()
})