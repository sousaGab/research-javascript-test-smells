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

  // First button (disabled)
  expect(first.classes()).toContain('page-item')
  expect(first.classes()).toContain('disabled')
  expect(first.classes()).not.toContain('active')
  expect(first.find('.page-link').element.tagName).toBe('SPAN')
  expect(first.find('.page-link').text()).toEqual('«')

  // Previous button (disabled)
  expect(prev.classes()).toContain('page-item')
  expect(prev.classes()).toContain('disabled')
  expect(prev.classes()).not.toContain('active')
  expect(prev.find('.page-link').element.tagName).toBe('SPAN')
  expect(prev.find('.page-link').text()).toEqual('‹')

  // Page 1 button (active)
  expect(page.classes()).toContain('page-item')
  expect(page.classes()).not.toContain('disabled')
  expect(page.classes()).toContain('active')
  expect(page.find('.page-link').element.tagName).toBe('BUTTON')
  expect(page.find('.page-link').text()).toEqual('1')
  expect(page.find('.page-link').attributes('type')).toEqual('button')
  expect(page.find('.page-link').attributes('role')).toEqual('menuitemradio')
  expect(page.find('.page-link').attributes('aria-checked')).toEqual('true')
  expect(page.find('.page-link').attributes('aria-posinset')).toEqual('1')
  expect(page.find('.page-link').attributes('aria-setsize')).toEqual('1')
  expect(page.find('.page-link').attributes('tabindex')).toEqual('0')
  expect(page.find('.page-link').attributes('aria-label')).toEqual('Go to page 1')

  // Next button (disabled)
  expect(next.classes()).toContain('page-item')
  expect(next.classes()).toContain('disabled')
  expect(next.classes()).not.toContain('active')
  expect(next.find('.page-link').element.tagName).toBe('SPAN')
  expect(next.find('.page-link').text()).toEqual('›')

  // Last button (disabled)
  expect(last.classes()).toContain('page-item')
  expect(last.classes()).toContain('disabled')
  expect(last.classes()).not.toContain('active')
  expect(last.find('.page-link').element.tagName).toBe('SPAN')
  expect(last.find('.page-link').text()).toEqual('»')

  wrapper.destroy()
})