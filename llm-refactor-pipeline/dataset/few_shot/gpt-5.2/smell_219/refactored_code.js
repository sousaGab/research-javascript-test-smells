it('shows when IntersectionObserver not supported', async () => {
  const wrapper = mount(BImgLazy, {
    attachTo: document.body,
    propsData: {
      src,
      show: false
    }
  })

  const flushVisibilityUpdates = async (times = 1) => {
    for (let i = 0; i < times; i++) {
      await waitNT(wrapper.vm)
      await waitRAF()
    }
  }

  expect(wrapper.element.tagName).toBe('IMG')

  await flushVisibilityUpdates(3)

  expect(wrapper.vm.isShown).toBe(true)
  expect(wrapper.attributes('src')).toBeDefined()
  expect(wrapper.attributes('src')).toContain(src)

  await wrapper.setProps({ show: true })
  await flushVisibilityUpdates(2)

  expect(wrapper.attributes('src')).toBe(src)
  expect(wrapper.vm.isShown).toBe(true)

  await wrapper.setProps({ show: false })
  await flushVisibilityUpdates(2)

  expect(wrapper.attributes('src')).toContain(src)

  wrapper.destroy()
})