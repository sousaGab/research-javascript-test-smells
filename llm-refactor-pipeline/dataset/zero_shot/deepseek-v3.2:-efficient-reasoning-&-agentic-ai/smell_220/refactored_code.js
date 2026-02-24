it('if focus leaves modal it returns to modal', async () => {
  const App = {
    render(h) {
      return h('div', [
        h('button', { attrs: { id: 'button', type: 'button' } }, 'Button'),
        h(BModal, { props: { static: true, id: 'test', visible: true } }, 'Modal content')
      ])
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })

  expect(wrapper.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  const $button = wrapper.find('#button')
  expect($button.exists()).toBe(true)
  expect($button.element.tagName).toBe('BUTTON')

  const $modal = wrapper.find('div.modal')
  expect($modal.exists()).toBe(true)
  const $content = $modal.find('div.modal-content')
  expect($content.exists()).toBe(true)

  expect($modal.element.style.display).toEqual('block')
  expect(document.activeElement).not.toBe(document.body)
  expect(document.activeElement).toBe($content.element)

  $button.element.focus()
  await $button.trigger('focusin')
  expect(document.activeElement).not.toBe($button.element)
  expect(document.activeElement).toBe($content.element)

  const $bottomTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['bottom-trap'])
  expect($bottomTrap.exists()).toBe(true)
  expect($bottomTrap.element.tagName).toBe('SPAN')
  const $closeButton = $modal.find('button.close')
  expect($closeButton.exists()).toBe(true)
  expect($closeButton.element.tagName).toBe('BUTTON')
  $bottomTrap.element.focus()
  await $bottomTrap.trigger('focusin')
  expect(document.activeElement).not.toBe($bottomTrap.element)
  expect(document.activeElement).not.toBe($content.element)
  expect(document.activeElement).toBe($closeButton.element)

  const $topTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['top-trap'])
  expect($topTrap.exists()).toBe(true)
  expect($topTrap.element.tagName).toBe('SPAN')
  const $okButton = $modal.find('button.btn.btn-primary')
  expect($okButton.exists()).toBe(true)
  expect($okButton.element.tagName).toBe('BUTTON')
  $topTrap.element.focus()
  await $topTrap.trigger('focusin')
  expect(document.activeElement).not.toBe($topTrap.element)
  expect(document.activeElement).not.toBe($bottomTrap.element)
  expect(document.activeElement).not.toBe($content.element)
  expect(document.activeElement).toBe($okButton.element)

  wrapper.destroy()
})