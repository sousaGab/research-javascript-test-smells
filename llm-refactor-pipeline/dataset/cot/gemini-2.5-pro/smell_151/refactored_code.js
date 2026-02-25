describe('BPagination with a single page', () => {
  let wrapper
  let listItems

  beforeEach(async () => {
    wrapper = mount(BPagination, {
      propsData: {
        totalRows: 1,
        perPage: 1,
        value: 1
      }
    })
    listItems = wrapper.findAll('li')
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the correct root element and basic list item structure', () => {
    expect(wrapper.element.tagName).toBe('UL')
    expect(listItems.length).toBe(5)
    listItems.wrappers.forEach(li => {
      expect(li.classes()).toContain('page-item')
      expect(li.find('.page-link').exists()).toBe(true)
    })
  })

  it('renders the active page button with correct state and attributes', () => {
    const pageItem = listItems.at(2)
    const pageLink = pageItem.find('.page-link')

    expect(pageItem.classes()).toContain('active')
    expect(pageItem.classes()).not.toContain('disabled')

    expect(pageLink.element.tagName).toBe('BUTTON')
    expect(pageLink.text()).toEqual('1')
    expect(pageLink.attributes('type')).toEqual('button')
    expect(pageLink.attributes('role')).toEqual('menuitemradio')
    expect(pageLink.attributes('aria-checked')).toEqual('true')
    expect(pageLink.attributes('aria-posinset')).toEqual('1')
    expect(pageLink.attributes('aria-setsize')).toEqual('1')
    expect(pageLink.attributes('tabindex')).toEqual('0')
    expect(pageLink.attributes('aria-label')).toEqual('Go to page 1')
  })

  it('renders the disabled navigation buttons correctly', () => {
    const testCases = [
      { name: 'first', index: 0, text: '«' },
      { name: 'previous', index: 1, text: '‹' },
      { name: 'next', index: 3, text: '›' },
      { name: 'last', index: 4, text: '»' }
    ]

    testCases.forEach(({ index, text }) => {
      const navItem = listItems.at(index)
      const navLink = navItem.find('.page-link')

      expect(navItem.classes()).toContain('disabled')
      expect(navItem.classes()).not.toContain('active')
      expect(navLink.element.tagName).toBe('SPAN')
      expect(navLink.text()).toEqual(text)
    })
  })
})