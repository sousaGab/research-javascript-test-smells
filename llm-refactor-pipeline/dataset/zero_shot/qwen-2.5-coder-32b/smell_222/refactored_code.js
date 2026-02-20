it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
    const wrapper = mount(BPagination, {
      propsData: {
        totalRows: 70,
        perPage: 10,
        limit: 7,
        value: 1
      }
    })
    expect(wrapper.element.tagName).toBe('UL')
    const lis = wrapper.findAll('li')
    expect(lis).toBeDefined()
    expect(lis.length).toBe(11)

    expect(wrapper.vm.computedCurrentPage).toBe(1)
    wrapper.findAll('li').wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      if (index === 0) {
        expect(li.classes()).toContain('disabled')
      } else if (index === 1) {
        expect(li.classes()).toContain('disabled')
      } else if (index === 9) {
        expect(li.classes()).not.toContain('disabled')
      } else if (index === 10) {
        expect(li.classes()).not.toContain('disabled')
      } else {
        if (index === 2) {
          expect(li.classes()).toContain('active')
        } else {
          expect(li.classes()).not.toContain('active')
        }
        if (index < 5) {
          expect(li.classes()).not.toContain('bv-d-xs-down-none')
        } else if (index > 4) {
          expect(li.classes()).toContain('bv-d-xs-down-none')
        }
      }
    })

    await wrapper.setProps({
      value: '4'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)
    wrapper.findAll('li').wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      if (index === 0) {
        expect(li.classes()).not.toContain('disabled')
      } else if (index === 1) {
        expect(li.classes()).not.toContain('disabled')
      } else if (index === 9) {
        expect(li.classes()).not.toContain('disabled')
      } else if (index === 10) {
        expect(li.classes()).not.toContain('disabled')
      } else {
        if (index === 5) {
          expect(li.classes()).toContain('active')
        } else {
          expect(li.classes()).not.toContain('active')
        }
        if (index > 3 && index < 7) {
          expect(li.classes()).not.toContain('bv-d-xs-down-none')
        } else if (index < 4 || index > 6) {
          expect(li.classes()).toContain('bv-d-xs-down-none')
        }
      }
    })

    await wrapper.setProps({
      value: '7'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)
    wrapper.findAll('li').wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      if (index >= 2 && index <= 5) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else if (index >= 6 && index <= 8) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    wrapper.destroy()
  })