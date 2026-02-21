it('renders the `Input1` component in Vue 2', async () => {
  const wrapper = mount(Input1, { attachTo: document.body })
  expect(wrapper.find('input').exists()).toBe(true)
})