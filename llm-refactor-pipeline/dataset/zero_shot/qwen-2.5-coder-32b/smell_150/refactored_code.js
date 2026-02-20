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
    const firstPageAssertions = [
      { index: 0, expectedClasses: ['page-item', 'disabled'] },
      { index: 1, expectedClasses: ['page-item', 'disabled'] },
      { index: 2, expectedClasses: ['page-item', 'active'] },
      { index: 3, expectedClasses: ['page-item'] },
      { index: 4, expectedClasses: ['page-item'] },
      { index: 5, expectedClasses: ['page-item'] },
      { index: 6, expectedClasses: ['page-item'] },
      { index: 7, expectedClasses: ['page-item'] },
      { index: 8, expectedClasses: ['page-item'] },
      { index: 9, expectedClasses: ['page-item', 'disabled'] },
      { index: 10, expectedClasses: ['page-item', 'disabled'] }
    ]

    firstPageAssertions.forEach(({ index, expectedClasses }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      expectedClasses.forEach(cls => {
        if (cls === 'active') {
          expect(li.classes()).toContain('active')
        } else if (cls === 'disabled') {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
      if (index >= 5) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    await wrapper.setProps({ value: '4' })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)

    const middlePageAssertions = [
      { index: 0, expectedClasses: ['page-item', 'disabled'] },
      { index: 1, expectedClasses: ['page-item', 'disabled'] },
      { index: 2, expectedClasses: ['page-item'] },
      { index: 3, expectedClasses: ['page-item'] },
      { index: 4, expectedClasses: ['page-item'] },
      { index: 5, expectedClasses: ['page-item', 'active'] },
      { index: 6, expectedClasses: ['page-item'] },
      { index: 7, expectedClasses: ['page-item'] },
      { index: 8, expectedClasses: ['page-item'] },
      { index: 9, expectedClasses: ['page-item', 'disabled'] },
      { index: 10, expectedClasses: ['page-item', 'disabled'] }
    ]

    middlePageAssertions.forEach(({ index, expectedClasses }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      expectedClasses.forEach(cls => {
        if (cls === 'active') {
          expect(li.classes()).toContain('active')
        } else if (cls === 'disabled') {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
      if (index < 4 || index > 6) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    await wrapper.setProps({ value: '7' })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)

    const lastPageAssertions = [
      { index: 0, expectedClasses: ['page-item', 'disabled'] },
      { index: 1, expectedClasses: ['page-item', 'disabled'] },
      { index: 2, expectedClasses: ['page-item'] },
      { index: 3, expectedClasses: ['page-item'] },
      { index: 4, expectedClasses: ['page-item'] },
      { index: 5, expectedClasses: ['page-item'] },
      { index: 6, expectedClasses: ['page-item'] },
      { index: 7, expectedClasses: ['page-item'] },
      { index: 8, expectedClasses: ['page-item'] },
      { index: 9, expectedClasses: ['page-item', 'disabled'] },
      { index: 10, expectedClasses: ['page-item', 'disabled'] }
    ]

    lastPageAssertions.forEach(({ index, expectedClasses }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      expectedClasses.forEach(cls => {
        if (cls === 'active') {
          expect(li.classes()).toContain('active')
        } else if (cls === 'disabled') {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
      if (index >= 2 && index <= 5) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else if (index >= 6 && index <= 8) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    wrapper.destroy()
  })