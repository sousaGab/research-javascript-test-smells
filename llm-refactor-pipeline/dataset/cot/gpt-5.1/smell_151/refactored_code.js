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

  const first = lis.at(0)
  const prev = lis.at(1)
  const page = lis.at(2)
  const next = lis.at(3)
  const last = lis.at(4)

  const items = [
    { li: first, isActive: false, isDisabled: true, tagName: 'SPAN' },
    { li: prev, isActive: false, isDisabled: true, tagName: 'SPAN' },
    { li: page, isActive: true, isDisabled: false, tagName: 'BUTTON' },
    { li: next, isActive: false, isDisabled: true, tagName: 'SPAN' },
    { li: last, isActive: false, isDisabled: true, tagName: 'SPAN' }
  ]

  items.forEach(({ li, isActive, isDisabled, tagName }) => {
    expect(li.classes()).toContain('page-item')
    const pageLink = li.find('.page-link')
    expect(pageLink).toBeDefined()
    if (isActive) {
      expect(li.classes()).toContain('active')
    } else {
      expect(li.classes()).not.toContain('active')
    }
    if (isDisabled) {
      expect(li.classes()).toContain('disabled')
    } else {
      expect(li.classes()).not.toContain('disabled')
    }
    expect(pageLink.element.tagName).toBe(tagName)
  })

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