(isVue3 ? it.skip : it)(
  'should not emit row-unhovered event when a row is unhovered and no listener is attached',
  async () => {
    // This test is skipped in Vue 3 because it's not possible to track if an event listener is attached.
    const wrapper = mount(BTable, {
      propsData: {
        fields: testFields,
        items: testItems
      }
    })

    expect(wrapper).toBeDefined()
    const $rows = wrapper.findAll('tbody > tr')
    expect($rows.length).toBe(3)

    expect(wrapper.emitted('row-unhovered')).toBeUndefined()
    await $rows.at(1).trigger('mouseleave')
    expect(wrapper.emitted('row-unhovered')).toBeUndefined()

    wrapper.destroy()
  }
)