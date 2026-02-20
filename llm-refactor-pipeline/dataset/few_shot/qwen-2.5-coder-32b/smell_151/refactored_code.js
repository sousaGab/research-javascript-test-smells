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

    // Test all li elements have correct classes and page-link structure
    lis.wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      const pageLink = li.find('.page-link')
      expect(pageLink).toBeDefined()
      
      // Common assertions for all items
      expect(li.classes()).not.toContain('active')
      expect(li.classes()).toContain('disabled')
      expect(pageLink.element.tagName).toBe('SPAN')
    })

    // Test active state specifically for middle item
    const page = lis.at(2)
    expect(page.classes()).toContain('active')
    expect(page.classes()).not.toContain('disabled')
    expect(page.find('.page-link').element.tagName).toBe('BUTTON')

    // Test navigation buttons
    const first = lis.at(0)
    const prev = lis.at(1)
    const next = lis.at(3)
    const last = lis.at(4)

    expect(first.find('.page-link').text()).toEqual('«')
    expect(prev.find('.page-link').text()).toEqual('‹')
    expect(next.find('.page-link').text()).toEqual('›')
    expect(last.find('.page-link').text()).toEqual('»')

    // Test page button attributes
    expect(page.find('.page-link').attributes('type')).toEqual('button')
    expect(page.find('.page-link').attributes('role')).toEqual('menuitemradio')
    expect(page.find('.page-link').attributes('aria-checked')).toEqual('true')
    expect(page.find('.page-link').attributes('aria-posinset')).toEqual('1')
    expect(page.find('.page-link').attributes('aria-setsize')).toEqual('1')
    expect(page.find('.page-link').attributes('tabindex')).toEqual('0')
    expect(page.find('.page-link').attributes('aria-label')).toEqual('Go to page 1')

    wrapper.destroy()
  })