it('renders with correct basic inner structure', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 1,
      perPage: 1,
      value: 1
    }
  })
  
  expect(wrapper.element.tagName).toBe('UL')
  const lis = wrapper.findAll('li')
  expect(lis).toBeDefined()
  expect(lis.length).toBe(5)

  // Common assertions for all list items
  lis.wrappers.forEach((li) => {
    expect(li.classes()).toContain('page-item')
    expect(li.find('.page-link')).toBeDefined()
  })

  // Assertions for disabled items (indices 0, 1, 3, 4)
  const disabledIndices = [0, 1, 3, 4]
  disabledIndices.forEach((index) => {
    const li = lis.at(index)
    expect(li.classes()).not.toContain('active')
    expect(li.classes()).toContain('disabled')
    expect(li.find('.page-link').element.tagName).toBe('SPAN')
  })

  // Assertions for active item (index 2)
  const activeLi = lis.at(2)
  expect(activeLi.classes()).toContain('active')
  expect(activeLi.classes()).not.toContain('disabled')
  expect(activeLi.find('.page-link').element.tagName).toBe('BUTTON')

  const first = lis.at(0)
  const prev = lis.at(1)
  const page = lis.at(2)
  const next = lis.at(3)
  const last = lis.at(4)

  // Button content
  expect(first.find('.page-link').text()).toEqual('«')
  expect(prev.find('.page-link').text()).toEqual('‹')
  expect(page.find('.page-link').text()).toEqual('1')
  expect(next.find('.page-link').text()).toEqual('›')
  expect(last.find('.page-link').text()).toEqual('»')

  // Page button attrs
  expect(page.find('.page-link').attributes('type')).toEqual('button')
  expect(page.find('.page-link').attributes('role')).toEqual('menuitemradio')
  expect(page.find('.page-link').attributes('aria-checked')).toEqual('true')
  expect(page.find('.page-link').attributes('aria-posinset')).toEqual('1')
  expect(page.find('.page-link').attributes('aria-setsize')).toEqual('1')
  expect(page.find('.page-link').attributes('tabindex')).toEqual('0')
  expect(page.find('.page-link').attributes('aria-label')).toEqual('Go to page 1')

  wrapper.destroy()
})