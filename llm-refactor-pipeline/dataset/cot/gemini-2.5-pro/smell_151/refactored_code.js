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
  expect(lis.length).toBe(5)

  const [first, prev, page, next, last] = lis.wrappers

  // Active page button assertions
  expect(page.classes()).toEqual(['page-item', 'active'])
  const pageLink = page.find('.page-link')
  expect(pageLink.exists()).toBe(true)
  expect(pageLink.element.tagName).toBe('BUTTON')
  expect(pageLink.text()).toEqual('1')
  expect(pageLink.attributes('type')).toEqual('button')
  expect(pageLink.attributes('role')).toEqual('menuitemradio')
  expect(pageLink.attributes('aria-checked')).toEqual('true')
  expect(pageLink.attributes('aria-posinset')).toEqual('1')
  expect(pageLink.attributes('aria-setsize')).toEqual('1')
  expect(pageLink.attributes('tabindex')).toEqual('0')
  expect(pageLink.attributes('aria-label')).toEqual('Go to page 1')

  // Disabled control buttons assertions
  const disabledItems = [
    { wrapper: first, text: '«' },
    { wrapper: prev, text: '‹' },
    { wrapper: next, text: '›' },
    { wrapper: last, text: '»' }
  ]

  disabledItems.forEach(({ wrapper: itemWrapper, text }) => {
    expect(itemWrapper.classes()).toEqual(['page-item', 'disabled'])
    const link = itemWrapper.find('.page-link')
    expect(link.exists()).toBe(true)
    expect(link.element.tagName).toBe('SPAN')
    expect(link.text()).toEqual(text)
  })

  wrapper.destroy()
})