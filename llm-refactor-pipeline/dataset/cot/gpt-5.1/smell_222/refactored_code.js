it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const expectBookendState = (li, { disabled }) => {
    expect(li.classes()).toContain('page-item')
    if (disabled) {
      expect(li.classes()).toContain('disabled')
    } else {
      expect(li.classes()).not.toContain('disabled')
    }
  }

  const expectPageButtonState = (li, { active, hidden }) => {
    expect(li.classes()).toContain('page-item')
    if (active) {
      expect(li.classes()).toContain('active')
    } else {
      expect(li.classes()).not.toContain('active')
    }
    if (hidden) {
      expect(li.classes()).toContain('bv-d-xs-down-none')
    } else {
      expect(li.classes()).not.toContain('bv-d-xs-down-none')
    }
  }

  const getLis = () => wrapper.findAll('li').wrappers

  expect(wrapper.element.tagName).toBe('UL')
  const lisInitial = wrapper.findAll('li')
  expect(lisInitial).toBeDefined()
  expect(lisInitial.length).toBe(11)

  expect(wrapper.vm.computedCurrentPage).toBe(1)

  getLis().forEach((li, index) => {
    if (index === 0) {
      expectBookendState(li, { disabled: true })
    } else if (index === 1) {
      expectBookendState(li, { disabled: true })
    } else if (index === 9) {
      expectBookendState(li, { disabled: false })
    } else if (index === 10) {
      expectBookendState(li, { disabled: false })
    } else {
      const isActive = index === 2
      const isHidden = index > 4
      expectPageButtonState(li, { active: isActive, hidden: isHidden })
    }
  })

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)

  getLis().forEach((li, index) => {
    if (index === 0) {
      expectBookendState(li, { disabled: false })
    } else if (index === 1) {
      expectBookendState(li, { disabled: false })
    } else if (index === 9) {
      expectBookendState(li, { disabled: false })
    } else if (index === 10) {
      expectBookendState(li, { disabled: false })
    } else {
      const isActive = index === 5
      const isVisibleMiddleRange = index > 3 && index < 7
      const isHidden = !isVisibleMiddleRange
      expectPageButtonState(li, { active: isActive, hidden: isHidden })
    }
  })

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  getLis().forEach((li, index) => {
    if (index >= 2 && index <= 5) {
      expectPageButtonState(li, { active: false, hidden: true })
    } else if (index >= 6 && index <= 8) {
      expectPageButtonState(li, { active: false, hidden: false })
    }
  })

  wrapper.destroy()
})