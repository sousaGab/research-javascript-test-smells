it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const getLis = () => wrapper.findAll('li').wrappers

  const expectBaseStructure = () => {
    expect(wrapper.element.tagName).toBe('UL')
    const lis = wrapper.findAll('li')
    expect(lis).toBeDefined()
    expect(lis.length).toBe(11)
  }

  const expectBookends = (lis, { firstDisabled, prevDisabled, nextDisabled, lastDisabled }) => {
    expect(lis[0].classes()).toContain('page-item')
    expect(lis[1].classes()).toContain('page-item')
    expect(lis[9].classes()).toContain('page-item')
    expect(lis[10].classes()).toContain('page-item')

    if (firstDisabled) {
      expect(lis[0].classes()).toContain('disabled')
    } else {
      expect(lis[0].classes()).not.toContain('disabled')
    }

    if (prevDisabled) {
      expect(lis[1].classes()).toContain('disabled')
    } else {
      expect(lis[1].classes()).not.toContain('disabled')
    }

    if (nextDisabled) {
      expect(lis[9].classes()).toContain('disabled')
    } else {
      expect(lis[9].classes()).not.toContain('disabled')
    }

    if (lastDisabled) {
      expect(lis[10].classes()).toContain('disabled')
    } else {
      expect(lis[10].classes()).not.toContain('disabled')
    }
  }

  const expectPageButtons = (lis, { activeIndex, visibleIndices }) => {
    lis.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')

      if (index < 2 || index > 8) {
        return
      }

      if (index === activeIndex) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }

      if (visibleIndices.includes(index)) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      }
    })
  }

  expectBaseStructure()

  expect(wrapper.vm.computedCurrentPage).toBe(1)
  {
    const lis = getLis()
    expectBookends(lis, {
      firstDisabled: true,
      prevDisabled: true,
      nextDisabled: false,
      lastDisabled: false
    })
    expectPageButtons(lis, {
      activeIndex: 2,
      visibleIndices: [2, 3, 4]
    })
  }

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  {
    const lis = getLis()
    expectBookends(lis, {
      firstDisabled: false,
      prevDisabled: false,
      nextDisabled: false,
      lastDisabled: false
    })
    expectPageButtons(lis, {
      activeIndex: 5,
      visibleIndices: [4, 5, 6]
    })
  }

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  {
    const lis = getLis()
    lis.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      if (index >= 2 && index <= 5) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else if (index >= 6 && index <= 8) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })
  }

  wrapper.destroy()
})