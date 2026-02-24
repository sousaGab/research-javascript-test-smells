it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const assertButtonStates = (wrapper, expectations) => {
    const lis = wrapper.findAll('li')
    expect(lis).toBeDefined()
    expect(lis.length).toBe(11)

    lis.wrappers.forEach((li, index) => {
      const exp = expectations[index]
      expect(li.classes()).toContain('page-item')

      if (!exp) {
        return
      }

      if (Object.prototype.hasOwnProperty.call(exp, 'disabled')) {
        if (exp.disabled) {
          expect(li.classes()).toContain('disabled')
        } else {
          expect(li.classes()).not.toContain('disabled')
        }
      }

      if (Object.prototype.hasOwnProperty.call(exp, 'active')) {
        if (exp.active) {
          expect(li.classes()).toContain('active')
        } else {
          expect(li.classes()).not.toContain('active')
        }
      }

      if (Object.prototype.hasOwnProperty.call(exp, 'hiddenXsDown')) {
        if (exp.hiddenXsDown) {
          expect(li.classes()).toContain('bv-d-xs-down-none')
        } else {
          expect(li.classes()).not.toContain('bv-d-xs-down-none')
        }
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

  // State when currentPage = 1
  expect(wrapper.vm.computedCurrentPage).toBe(1)
  assertButtonStates(wrapper, {
    0: { disabled: true },
    1: { disabled: true },
    2: { active: true, hiddenXsDown: false },
    3: { active: false, hiddenXsDown: false },
    4: { active: false, hiddenXsDown: false },
    5: { active: false, hiddenXsDown: true },
    6: { active: false, hiddenXsDown: true },
    7: { active: false, hiddenXsDown: true },
    8: { active: false, hiddenXsDown: true },
    9: { disabled: false },
    10: { disabled: false }
  })

  // State when currentPage = 4
  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  assertButtonStates(wrapper, {
    0: { disabled: false },
    1: { disabled: false },
    2: { active: false, hiddenXsDown: true },
    3: { active: false, hiddenXsDown: false },
    4: { active: false, hiddenXsDown: false },
    5: { active: true, hiddenXsDown: false },
    6: { active: false, hiddenXsDown: false },
    7: { active: false, hiddenXsDown: true },
    8: { active: false, hiddenXsDown: true },
    9: { disabled: false },
    10: { disabled: false }
  })

  // State when currentPage = 7
  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  assertButtonStates(wrapper, {
    2: { hiddenXsDown: true },
    3: { hiddenXsDown: true },
    4: { hiddenXsDown: true },
    5: { hiddenXsDown: true },
    6: { hiddenXsDown: false },
    7: { hiddenXsDown: false },
    8: { hiddenXsDown: false }
  })

  wrapper.destroy()
})