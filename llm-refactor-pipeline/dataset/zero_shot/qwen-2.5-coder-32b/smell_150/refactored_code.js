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
    const firstSetOfAssertions = [
      { index: 0, classes: ['page-item', 'disabled'] },
      { index: 1, classes: ['page-item', 'disabled'] },
      { index: 2, classes: ['page-item', 'active'] },
      { index: 3, classes: ['page-item'] },
      { index: 4, classes: ['page-item'] },
      { index: 5, classes: ['page-item'] },
      { index: 6, classes: ['page-item'] },
      { index: 7, classes: ['page-item'] },
      { index: 8, classes: ['page-item'] },
      { index: 9, classes: ['page-item', 'disabled'] },
      { index: 10, classes: ['page-item', 'disabled'] }
    ]
    firstSetOfAssertions.forEach(({ index, classes }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      classes.forEach(cls => {
        if (cls === 'active') {
          expect(li.classes()).toContain('active')
        } else if (cls === 'disabled') {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
      if (index < 5) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else if (index > 4) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      }
    })

    await wrapper.setProps({ value: '4' })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)
    const secondSetOfAssertions = [
      { index: 0, classes: ['page-item', 'disabled'] },
      { index: 1, classes: ['page-item', 'disabled'] },
      { index: 2, classes: ['page-item'] },
      { index: 3, classes: ['page-item'] },
      { index: 4, classes: ['page-item'] },
      { index: 5, classes: ['page-item', 'active'] },
      { index: 6, classes: ['page-item'] },
      { index: 7, classes: ['page-item'] },
      { index: 8, classes: ['page-item'] },
      { index: 9, classes: ['page-item', 'disabled'] },
      { index: 10, classes: ['page-item', 'disabled'] }
    ]
    secondSetOfAssertions.forEach(({ index, classes }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      classes.forEach(cls => {
        if (cls === 'active') {
          expect(li.classes()).toContain('active')
        } else if (cls === 'disabled') {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
      if (index > 3 && index < 7) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else if (index < 4 || index > 6) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      }
    })

    await wrapper.setProps({ value: '7' })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)
    const thirdSetOfAssertions = [
      { index: 0, classes: ['page-item', 'disabled'] },
      { index: 1, classes: ['page-item', 'disabled'] },
      { index: 2, classes: ['page-item', 'bv-d-xs-down-none'] },
      { index: 3, classes: ['page-item', 'bv-d-xs-down-none'] },
      { index: 4, classes: ['page-item', 'bv-d-xs-down-none'] },
      { index: 5, classes: ['page-item', 'bv-d-xs-down-none'] },
      { index: 6, classes: ['page-item'] },
      { index: 7, classes: ['page-item'] },
      { index: 8, classes: ['page-item'] },
      { index: 9, classes: ['page-item', 'disabled'] },
      { index: 10, classes: ['page-item', 'disabled'] }
    ]
    thirdSetOfAssertions.forEach(({ index, classes }) => {
      const li = lis.wrappers[index]
      expect(li.classes()).toContain('page-item')
      classes.forEach(cls => {
        if (cls === 'bv-d-xs-down-none') {
          expect(li.classes()).toContain('bv-d-xs-down-none')
        } else {
          expect(li.classes()).toContain(cls)
        }
      })
    })

    wrapper.destroy()
  })