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
    { index: 0, classes: ['page-item', 'disabled'] },
    { index: 1, classes: ['page-item', 'disabled'] },
    { index: 2, classes: ['page-item', 'active'] },
    { index: 3, classes: ['page-item'] },
    { index: 4, classes: ['page-item'] },
    { index: 5, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 6, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 7, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 8, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 9, classes: ['page-item'] },
    { index: 10, classes: ['page-item'] }
  ]

  firstPageAssertions.forEach(({ index, classes }) => {
    const li = lis.at(index)
    classes.forEach(className => {
      if (className === 'active' && index !== 2) {
        expect(li.classes()).not.toContain('active')
      } else if (className === 'disabled' && ![0, 1].includes(index)) {
        expect(li.classes()).not.toContain('disabled')
      } else if (className === 'bv-d-xs-down-none' && index < 5) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).toContain(className)
      }
    })
  })

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)

  const fourthPageAssertions = [
    { index: 0, classes: ['page-item'] },
    { index: 1, classes: ['page-item'] },
    { index: 2, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 3, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 4, classes: ['page-item'] },
    { index: 5, classes: ['page-item', 'active'] },
    { index: 6, classes: ['page-item'] },
    { index: 7, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 8, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 9, classes: ['page-item'] },
    { index: 10, classes: ['page-item'] }
  ]

  fourthPageAssertions.forEach(({ index, classes }) => {
    const li = lis.at(index)
    classes.forEach(className => {
      if (className === 'active' && index !== 5) {
        expect(li.classes()).not.toContain('active')
      } else if (className === 'disabled' && ![0, 1, 9, 10].includes(index)) {
        expect(li.classes()).not.toContain('disabled')
      } else if (className === 'bv-d-xs-down-none' && index > 3 && index < 7) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).toContain(className)
      }
    })
  })

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  const seventhPageAssertions = [
    { index: 2, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 3, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 4, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 5, classes: ['page-item', 'bv-d-xs-down-none'] },
    { index: 6, classes: ['page-item'] },
    { index: 7, classes: ['page-item'] },
    { index: 8, classes: ['page-item'] }
  ]

  seventhPageAssertions.forEach(({ index, classes }) => {
    const li = lis.at(index)
    classes.forEach(className => {
      expect(li.classes()).toContain(className)
    })
  })

  wrapper.destroy()
})