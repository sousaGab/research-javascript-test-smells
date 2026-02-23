it('shows when IntersectionObserver not supported', async () => {
  const wrapper = mount(BImgLazy, {
    attachTo: document.body,
    propsData: {
      src,
      show: false
    }
  })

  const flush = async (cycles = 1) => {
    for (let i = 0; i < cycles; i++) {
      await waitNT(wrapper.vm)
      await waitRAF()
    }
  }

  expect(wrapper.element.tagName).toBe('IMG')

  await flush(3)
  expect(wrapper.vm.isShown).toBe(true)

  expect(wrapper.attributes('src')).toBeDefined()
  expect(wrapper.attributes('src')).toContain(src)

  await wrapper.setProps({ show: true })
  await flush(2)

  expect(wrapper.attributes('src')).toBe(src)
  expect(wrapper.vm.isShown).toBe(true)

  await wrapper.setProps({ show: false })
  await flush(2)

  expect(wrapper.attributes('src')).toContain(src)

  wrapper.destroy()
})