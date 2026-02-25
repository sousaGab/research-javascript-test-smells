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

  const first = lis.at(0)
  const prev = lis.at(1)
  const page = lis.at(2)
  const next = lis.at(3)
  const last = lis.at(4)

  // Active page button (item at index 2)
  expect(page.classes()).toEqual(['page-item', 'active'])
  const pageLink = page.find('.page-link')
  expect(pageLink.exists()).toBe(true)
  expect(pageLink.element.tagName).toBe('BUTTON')

  // Disabled buttons
  const disabledItems = [first, prev, next, last]
  disabledItems.forEach(item => {
    expect(item.classes()).toEqual(['page-item', 'disabled'])
    const link = item.find('.page-link')
    expect(link.exists()).toBe(true)
    expect(link.element.tagName).toBe('SPAN')
  })

  // Button content
  expect(first.find('.page-link').text()).toEqual('«')
  expect(prev.find('.page-link').text()).toEqual('‹')
  expect(page.find('.page-link').text()).toEqual('1')
  expect(next.find('.page-link').text()).toEqual('›')
  expect(last.find('.page-link').text()).toEqual('»')

  // Active page button attributes
  expect(pageLink.attributes('type')).toEqual('button')
  expect(pageLink.attributes('role')).toEqual('menuitemradio')
  expect(pageLink.attributes('aria-checked')).toEqual('true')
  expect(pageLink.attributes('aria-posinset')).toEqual('1')
  expect(pageLink.attributes('aria-setsize')).toEqual('1')
  expect(pageLink.attributes('tabindex')).toEqual('0')
  expect(pageLink.attributes('aria-label')).toEqual('Go to page 1')

  wrapper.destroy()
})