it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const assertButtonState = (li, { disabled, active, hidden }) => {
    expect(li.classes()).toContain('page-item')
    if (disabled !== undefined) {
      if (disabled) {
        expect(li.classes()).toContain('disabled')
      } else {
        expect(li.classes()).not.toContain('disabled')
      }
    }
    if (active !== undefined) {
      if (active) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
    }
    if (hidden !== undefined) {
      if (hidden) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    }
  }

  const assertStateForPage1 = wrapper => {
    const lis = wrapper.findAll('li')
    expect(lis).toBeDefined()
    expect(lis.length).toBe(11)
    expect(wrapper.vm.computedCurrentPage).toBe(1)

    const expectedStates = [
      { disabled: true }, // 0 First
      { disabled: true }, // 1 Prev
      { active: true, hidden: false }, // 2
      { active: false, hidden: false }, // 3
      { active: false, hidden: false }, // 4
      { active: false, hidden: false }, // 5
      { active: false, hidden: true }, // 6
      { active: false, hidden: true }, // 7
      { active: false, hidden: true }, // 8
      { disabled: false }, // 9 Next
      { disabled: false } // 10 Last
    ]

    lis.wrappers.forEach((li, index) => {
      assertButtonState(li, expectedStates[index])
    })
  }

  const assertStateForPage4 = wrapper => {
    const lis = wrapper.findAll('li')
    expect(wrapper.vm.computedCurrentPage).toBe(4)

    const expectedStates = [
      { disabled: false }, // 0 First
      { disabled: false }, // 1 Prev
      { active: false, hidden: true }, // 2
      { active: false, hidden: true }, // 3
      { active: false, hidden: false }, // 4
      { active: true, hidden: false }, // 5
      { active: false, hidden: false }, // 6
      { active: false, hidden: true }, // 7
      { active: false, hidden: true }, // 8
      { disabled: false }, // 9 Next
      { disabled: false } // 10 Last
    ]

    lis.wrappers.forEach((li, index) => {
      assertButtonState(li, expectedStates[index])
    })
  }

  const assertStateForPage7 = wrapper => {
    const lis = wrapper.findAll('li')
    expect(wrapper.vm.computedCurrentPage).toBe(7)

    lis.wrappers.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')
      if (index >= 2 && index <= 5) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else if (index >= 6 && index <= 8) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })
  }

  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  expect(wrapper.element.tagName).toBe('UL')

  assertStateForPage1(wrapper)

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  assertStateForPage4(wrapper)

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  assertStateForPage7(wrapper)

  wrapper.destroy()
})