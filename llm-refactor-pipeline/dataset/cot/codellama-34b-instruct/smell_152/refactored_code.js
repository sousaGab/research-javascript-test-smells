import { mount } from '@vue/test-utils'
import BTable from '@/components/BTable.vue'

describe('BTable', () => {
  it('should not emit row-unhovered event when a row is hovered and no listener', async () => {
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
  })
})

class BTableTest {
  isVue3() {
    return true
  }
}