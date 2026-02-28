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

  const verifyPageItemClasses = (wrapper, expectedActiveIndex, expectedVisibleRange, expectedDisabled = { first: false, prev: false, next: false, last: false }) => {
    wrapper.findAll('li').wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')

      if (index === 0) {
        expect(li.classes()).toContain(expectedDisabled.first ? 'disabled' : '')
        expect(li.classes()).not.toContain(!expectedDisabled.first ? 'disabled' : '')
      } else if (index === 1) {
        expect(li.classes()).toContain(expectedDisabled.prev ? 'disabled' : '')
        expect(li.classes()).not.toContain(!expectedDisabled.prev ? 'disabled' : '')
      } else if (index === 9) {
        expect(li.classes()).toContain(expectedDisabled.next ? 'disabled' : '')
        expect(li.classes()).not.toContain(!expectedDisabled.next ? 'disabled' : '')
      } else if (index === 10) {
        expect(li.classes()).toContain(expectedDisabled.last ? 'disabled' : '')
        expect(li.classes()).not.toContain(!expectedDisabled.last ? 'disabled' : '')
      } else {
        if (index === expectedActiveIndex) {
          expect(li.classes()).toContain('active')
        } else {
          expect(li.classes()).not.toContain('active')
        }

        const isVisible = index >= expectedVisibleRange.start && index <= expectedVisibleRange.end
        if (isVisible) {
          expect(li.classes()).not.toContain('bv-d-xs-down-none')
        } else {
          expect(li.classes()).toContain('bv-d-xs-down-none')
        }
      }
    })
  }

  expect(wrapper.vm.computedCurrentPage).toBe(1)
  verifyPageItemClasses(wrapper, 2, { start: 2, end: 4 }, { first: true, prev: true, next: false, last: false })

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  verifyPageItemClasses(wrapper, 5, { start: 4, end: 6 }, { first: false, prev: false, next: false, last: false })

  await wrapper.setProps({ value: '7' })
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