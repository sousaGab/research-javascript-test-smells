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

    const pageLink = lis.at(2).find('.page-link')
    expect(pageLink).toBeDefined()
    expect(pageLink.element.tagName).toBe('BUTTON')
    expect(pageLink.classes()).toContain('page-item')
    expect(pageLink.classes()).toContain('active')
    expect(pageLink.classes()).not.toContain('disabled')

    const first = lis.at(0)
    const prev = lis.at(1)
    const next = lis.at(3)
    const last = lis.at(4)

    // Button content
    expect(first.find('.page-link').text()).toEqual('«')
    expect(prev.find('.page-link').text()).toEqual('‹')
    expect(pageLink.text()).toEqual('1')
    expect(next.find('.page-link').text()).toEqual('›')
    expect(last.find('.page-link').text()).toEqual('»')

    // Page button attrs
    expect(pageLink.attributes('type')).toEqual('button')
    expect(pageLink.attributes('role')).toEqual('menuitemradio')
    expect(pageLink.attributes('aria-checked')).toEqual('true')
    expect(pageLink.attributes('aria-posinset')).toEqual('1')
    expect(pageLink.attributes('aria-setsize')).toEqual('1')
    expect(pageLink.attributes('tabindex')).toEqual('0')
    expect(pageLink.attributes('aria-label')).toEqual('Go to page 1')

    wrapper.destroy()
  })