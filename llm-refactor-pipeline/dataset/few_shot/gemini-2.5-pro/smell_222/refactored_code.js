describe('BPagination responsive visibility', () => {
  const mountPagination = props => {
    return mount(BPagination, {
      propsData: {
        totalRows: 70,
        perPage: 10,
        limit: 7,
        ...props
      }
    })
  }

  const assertItemsState = (wrapper, expectedStates) => {
    const lis = wrapper.findAll('li').wrappers
    expect(lis.length).toBe(expectedStates.length)

    lis.forEach((li, i) => {
      const state = expectedStates[i]
      const description = `Item ${i} (${li.text()})`

      expect(li.classes('disabled'), `${description} disabled state`).toBe(state.disabled)
      expect(li.classes('active'), `${description} active state`).toBe(state.active)
      expect(li.classes('bv-d-xs-down-none'), `${description} visibility`).toBe(state.hidden)
    })
  }

  it('hides later page buttons when on the first page', async () => {
    const wrapper = mountPagination({
      value: 1
    })

    const expectedStates = [
      {
        disabled: true,
        active: false,
        hidden: false
      }, // First
      {
        disabled: true,
        active: false,
        hidden: false
      }, // Prev
      {
        disabled: false,
        active: true,
        hidden: false
      }, // Page 1
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Page 2
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Page 3
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 4
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 5
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 6
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 7
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Next
      {
        disabled: false,
        active: false,
        hidden: false
      } // Last
    ]

    assertItemsState(wrapper, expectedStates)
  })

  it('hides early and late page buttons when on a middle page', async () => {
    const wrapper = mountPagination({
      value: 4
    })

    const expectedStates = [
      {
        disabled: false,
        active: false,
        hidden: false
      }, // First
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Prev
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 1
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 2
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Page 3
      {
        disabled: false,
        active: true,
        hidden: false
      }, // Page 4
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Page 5
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 6
      {
        disabled: false,
        active: false,
        hidden: true
      }, // Page 7
      {
        disabled: false,
        active: false,
        hidden: false
      }, // Next
      {
        disabled: false,
        active: false,
        hidden: false
      } // Last
    ]

    assertItemsState(wrapper, expectedStates)
  })

  it('hides early page buttons when on the last page', async () => {
    const wrapper = mountPagination({
      value: 7
    })

    const lis = wrapper.findAll('li').wrappers
    const pageButtons = lis.slice(2, 9)

    const expectedVisibility = [
      true, // Page 1
      true, // Page 2
      true, // Page 3
      true, // Page 4
      false, // Page 5
      false, // Page 6
      false // Page 7
    ]

    pageButtons.forEach((li, i) => {
      expect(li.classes('bv-d-xs-down-none'), `Page ${i + 1} visibility`).toBe(
        expectedVisibility[i]
      )
    })
  })
})