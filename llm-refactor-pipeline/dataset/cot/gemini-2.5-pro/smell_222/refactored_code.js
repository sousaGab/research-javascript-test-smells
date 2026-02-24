describe('BPagination responsive visibility classes', () => {
  const mountPagination = props => {
    return mount(BPagination, {
      propsData: {
        totalRows: 70, // 7 pages
        perPage: 10,
        limit: 7,
        ...props
      }
    })
  }

  const getVisibilityState = wrapper => {
    const listItems = wrapper.findAll('li')
    // Page number buttons are between the first two and last two bookend buttons
    return listItems.wrappers.slice(2, -2).map(li => li.classes().includes('bv-d-xs-down-none'))
  }

  it('hides trailing page buttons when on the first page', async () => {
    const wrapper = mountPagination({
      value: 1
    })

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(11) // 7 pages + 4 bookends

    // Assert bookend button states
    expect(listItems.at(0).classes()).toContain('disabled') // First
    expect(listItems.at(1).classes()).toContain('disabled') // Prev
    expect(listItems.at(9).classes()).not.toContain('disabled') // Next
    expect(listItems.at(10).classes()).not.toContain('disabled') // Last

    // Assert active page
    expect(listItems.at(2).classes()).toContain('active') // Page 1

    // Assert responsive visibility
    const visibility = getVisibilityState(wrapper)
    expect(visibility).toEqual([
      false, // Page 1
      false, // Page 2
      false, // Page 3
      true, // Page 4
      true, // Page 5
      true, // Page 6
      true // Page 7
    ])

    wrapper.destroy()
  })

  it('hides leading and trailing page buttons when on a middle page', async () => {
    const wrapper = mountPagination({
      value: 4
    })
    await waitNT(wrapper.vm)

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(11)

    // Assert bookend button states
    expect(listItems.at(0).classes()).not.toContain('disabled') // First
    expect(listItems.at(1).classes()).not.toContain('disabled') // Prev
    expect(listItems.at(9).classes()).not.toContain('disabled') // Next
    expect(listItems.at(10).classes()).not.toContain('disabled') // Last

    // Assert active page
    expect(listItems.at(5).classes()).toContain('active') // Page 4

    // Assert responsive visibility
    const visibility = getVisibilityState(wrapper)
    expect(visibility).toEqual([
      true, // Page 1
      true, // Page 2
      false, // Page 3
      false, // Page 4
      false, // Page 5
      true, // Page 6
      true // Page 7
    ])

    wrapper.destroy()
  })

  it('hides leading page buttons when on the last page', async () => {
    const wrapper = mountPagination({
      value: 7
    })
    await waitNT(wrapper.vm)

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(11)

    // Assert bookend button states
    expect(listItems.at(0).classes()).not.toContain('disabled') // First
    expect(listItems.at(1).classes()).not.toContain('disabled') // Prev
    expect(listItems.at(9).classes()).toContain('disabled') // Next
    expect(listItems.at(10).classes()).toContain('disabled') // Last

    // Assert active page
    expect(listItems.at(8).classes()).toContain('active') // Page 7

    // Assert responsive visibility
    const visibility = getVisibilityState(wrapper)
    expect(visibility).toEqual([
      true, // Page 1
      true, // Page 2
      true, // Page 3
      true, // Page 4
      false, // Page 5
      false, // Page 6
      false // Page 7
    ])

    wrapper.destroy()
  })
})