describe('BPagination responsive class rendering', () => {
  const PROPS_DATA = {
    totalRows: 70, // 7 pages
    perPage: 10,
    limit: 7, // Show all 7 page buttons
  }

  const getLiClasses = wrapper => {
    return wrapper.findAll('li').wrappers.map(li => li.classes().sort())
  }

  it('applies correct classes when on the first page', () => {
    const wrapper = mount(BPagination, {
      propsData: { ...PROPS_DATA,
        value: 1
      }
    })

    expect(wrapper.findAll('li').length).toBe(11)

    const expectedClasses = [
      ['disabled', 'page-item'], // First
      ['disabled', 'page-item'], // Prev
      ['active', 'page-item'], // Page 1
      ['page-item'], // Page 2
      ['page-item'], // Page 3
      ['bv-d-xs-down-none', 'page-item'], // Page 4
      ['bv-d-xs-down-none', 'page-item'], // Page 5
      ['bv-d-xs-down-none', 'page-item'], // Page 6
      ['bv-d-xs-down-none', 'page-item'], // Page 7
      ['page-item'], // Next
      ['page-item'] // Last
    ].map(classArray => classArray.sort())

    expect(getLiClasses(wrapper)).toEqual(expectedClasses)
    wrapper.destroy()
  })

  it('applies correct classes when on a middle page', async () => {
    const wrapper = mount(BPagination, {
      propsData: { ...PROPS_DATA,
        value: 4
      }
    })
    await waitNT(wrapper.vm)

    expect(wrapper.findAll('li').length).toBe(11)

    const expectedClasses = [
      ['page-item'], // First
      ['page-item'], // Prev
      ['bv-d-xs-down-none', 'page-item'], // Page 1
      ['bv-d-xs-down-none', 'page-item'], // Page 2
      ['page-item'], // Page 3
      ['active', 'page-item'], // Page 4
      ['page-item'], // Page 5
      ['bv-d-xs-down-none', 'page-item'], // Page 6
      ['bv-d-xs-down-none', 'page-item'], // Page 7
      ['page-item'], // Next
      ['page-item'] // Last
    ].map(classArray => classArray.sort())

    expect(getLiClasses(wrapper)).toEqual(expectedClasses)
    wrapper.destroy()
  })

  it('applies correct classes when on the last page', async () => {
    const wrapper = mount(BPagination, {
      propsData: { ...PROPS_DATA,
        value: 7
      }
    })
    await waitNT(wrapper.vm)

    expect(wrapper.findAll('li').length).toBe(11)

    const expectedClasses = [
      ['page-item'], // First
      ['page-item'], // Prev
      ['bv-d-xs-down-none', 'page-item'], // Page 1
      ['bv-d-xs-down-none', 'page-item'], // Page 2
      ['bv-d-xs-down-none', 'page-item'], // Page 3
      ['bv-d-xs-down-none', 'page-item'], // Page 4
      ['page-item'], // Page 5
      ['page-item'], // Page 6
      ['active', 'page-item'], // Page 7
      ['disabled', 'page-item'], // Next
      ['disabled', 'page-item'] // Last
    ].map(classArray => classArray.sort())

    expect(getLiClasses(wrapper)).toEqual(expectedClasses)
    wrapper.destroy()
  })
})