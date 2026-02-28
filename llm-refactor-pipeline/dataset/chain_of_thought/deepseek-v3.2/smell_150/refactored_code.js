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
  
  const firstPageExpectations = [
    { index: 0, disabled: true, active: false, displayClass: false },
    { index: 1, disabled: true, active: false, displayClass: false },
    { index: 2, disabled: false, active: true, displayClass: false },
    { index: 3, disabled: false, active: false, displayClass: false },
    { index: 4, disabled: false, active: false, displayClass: false },
    { index: 5, disabled: false, active: false, displayClass: true },
    { index: 6, disabled: false, active: false, displayClass: true },
    { index: 7, disabled: false, active: false, displayClass: true },
    { index: 8, disabled: false, active: false, displayClass: true },
    { index: 9, disabled: false, active: false, displayClass: false },
    { index: 10, disabled: false, active: false, displayClass: false }
  ]
  
  verifyPageState(wrapper, firstPageExpectations)
  
  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  
  const middlePageExpectations = [
    { index: 0, disabled: false, active: false, displayClass: true },
    { index: 1, disabled: false, active: false, displayClass: true },
    { index: 2, disabled: false, active: false, displayClass: true },
    { index: 3, disabled: false, active: false, displayClass: true },
    { index: 4, disabled: false, active: false, displayClass: false },
    { index: 5, disabled: false, active: true, displayClass: false },
    { index: 6, disabled: false, active: false, displayClass: false },
    { index: 7, disabled: false, active: false, displayClass: true },
    { index: 8, disabled: false, active: false, displayClass: true },
    { index: 9, disabled: false, active: false, displayClass: false },
    { index: 10, disabled: false, active: false, displayClass: false }
  ]
  
  verifyPageState(wrapper, middlePageExpectations)
  
  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  
  const lastPageExpectations = [
    { index: 0, disabled: false, active: false, displayClass: false },
    { index: 1, disabled: false, active: false, displayClass: false },
    { index: 2, disabled: false, active: false, displayClass: true },
    { index: 3, disabled: false, active: false, displayClass: true },
    { index: 4, disabled: false, active: false, displayClass: true },
    { index: 5, disabled: false, active: false, displayClass: true },
    { index: 6, disabled: false, active: false, displayClass: false },
    { index: 7, disabled: false, active: false, displayClass: false },
    { index: 8, disabled: false, active: false, displayClass: false },
    { index: 9, disabled: false, active: false, displayClass: false },
    { index: 10, disabled: false, active: false, displayClass: false }
  ]
  
  verifyPageState(wrapper, lastPageExpectations)
  
  wrapper.destroy()
})

function verifyPageState(wrapper, expectations) {
  const lis = wrapper.findAll('li')
  
  expectations.forEach((expectation, index) => {
    const li = lis.at(index)
    expect(li.classes()).toContain('page-item')
    
    if (expectation.disabled !== undefined) {
      if (expectation.disabled) {
        expect(li.classes()).toContain('disabled')
      } else {
        expect(li.classes()).not.toContain('disabled')
      }
    }
    
    if (expectation.active !== undefined) {
      if (expectation.active) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
    }
    
    if (expectation.displayClass !== undefined) {
      if (expectation.displayClass) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    }
  })
}