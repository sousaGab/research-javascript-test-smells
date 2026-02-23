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

  // Destructure the list items for clarity
  const [firstBtn, prevBtn, pageBtn, nextBtn, lastBtn] = lis.wrappers

  // Assertions for the "First" button (disabled)
  expect(firstBtn.classes()).toEqual(['page-item', 'disabled'])
  const firstLink = firstBtn.find('.page-link')
  expect(firstLink.exists()).toBe(true)
  expect(firstLink.element.tagName).toBe('SPAN')
  expect(firstLink.text()).toEqual('«')

  // Assertions for the "Previous" button (disabled)
  expect(prevBtn.classes()).toEqual(['page-item', 'disabled'])
  const prevLink = prevBtn.find('.page-link')
  expect(prevLink.exists()).toBe(true)
  expect(prevLink.element.tagName).toBe('SPAN')
  expect(prevLink.text()).toEqual('‹')

  // Assertions for the "Page" button (active)
  expect(pageBtn.classes()).toEqual(['page-item', 'active'])
  const pageLink = pageBtn.find('.page-link')
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

  // Assertions for the "Next" button (disabled)
  expect(nextBtn.classes()).toEqual(['page-item', 'disabled'])
  const nextLink = nextBtn.find('.page-link')
  expect(nextLink.exists()).toBe(true)
  expect(nextLink.element.tagName).toBe('SPAN')
  expect(nextLink.text()).toEqual('›')

  // Assertions for the "Last" button (disabled)
  expect(lastBtn.classes()).toEqual(['page-item', 'disabled'])
  const lastLink = lastBtn.find('.page-link')
  expect(lastLink.exists()).toBe(true)
  expect(lastLink.element.tagName).toBe('SPAN')
  expect(lastLink.text()).toEqual('»')

  wrapper.destroy()
})