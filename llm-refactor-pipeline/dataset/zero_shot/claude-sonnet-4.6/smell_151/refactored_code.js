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

    // Check all li elements have page-item class
    expect(first.classes()).toContain('page-item')
    expect(prev.classes()).toContain('page-item')
    expect(page.classes()).toContain('page-item')
    expect(next.classes()).toContain('page-item')
    expect(last.classes()).toContain('page-item')

    // Check all li elements have .page-link
    expect(first.find('.page-link')).toBeDefined()
    expect(prev.find('.page-link')).toBeDefined()
    expect(page.find('.page-link')).toBeDefined()
    expect(next.find('.page-link')).toBeDefined()
    expect(last.find('.page-link')).toBeDefined()

    // Check active/disabled for non-page items (first, prev, next, last)
    expect(first.classes()).not.toContain('active')
    expect(first.classes()).toContain('disabled')
    expect(first.find('.page-link').element.tagName).toBe('SPAN')

    expect(prev.classes()).not.toContain('active')
    expect(prev.classes()).toContain('disabled')
    expect(prev.find('.page-link').element.tagName).toBe('SPAN')

    expect(next.classes()).not.toContain('active')
    expect(next.classes()).toContain('disabled')
    expect(next.find('.page-link').element.tagName).toBe('SPAN')

    expect(last.classes()).not.toContain('active')
    expect(last.classes()).toContain('disabled')
    expect(last.find('.page-link').element.tagName).toBe('SPAN')

    // Check active/disabled for page item
    expect(page.classes()).toContain('active')
    expect(page.classes()).not.toContain('disabled')
    expect(page.find('.page-link').element.tagName).toBe('BUTTON')

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