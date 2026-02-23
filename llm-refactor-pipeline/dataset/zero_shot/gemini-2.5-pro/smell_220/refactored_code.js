it('traps focus within the modal', async () => {
  const App = {
    render(h) {
      return h('div', [
        h('button', {
          attrs: {
            id: 'button',
            type: 'button'
          }
        }, 'Button'),
        h(BModal, {
          props: {
            static: true,
            id: 'test',
            visible: true
          }
        }, 'Modal content')
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

  const outsideButton = wrapper.find('#button')
  expect(outsideButton.exists()).toBe(true)
  expect(outsideButton.element.tagName).toBe('BUTTON')

  const modal = wrapper.find('div.modal')
  expect(modal.exists()).toBe(true)
  const modalContent = modal.find('div.modal-content')
  expect(modalContent.exists()).toBe(true)

  expect(modal.element.style.display).toEqual('block')
  expect(document.activeElement).not.toBe(document.body)
  expect(document.activeElement).toBe(modalContent.element)

  outsideButton.element.focus()
  await outsideButton.trigger('focusin')
  expect(document.activeElement).not.toBe(outsideButton.element)
  expect(document.activeElement).toBe(modalContent.element)

  const bottomTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['bottom-trap'])
  expect(bottomTrap.exists()).toBe(true)
  expect(bottomTrap.element.tagName).toBe('SPAN')
  const firstFocusableElement = modal.find('button.close')
  expect(firstFocusableElement.exists()).toBe(true)
  expect(firstFocusableElement.element.tagName).toBe('BUTTON')

  bottomTrap.element.focus()
  await bottomTrap.trigger('focusin')

  expect(document.activeElement).not.toBe(bottomTrap.element)
  expect(document.activeElement).not.toBe(modalContent.element)
  expect(document.activeElement).toBe(firstFocusableElement.element)

  const topTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['top-trap'])
  expect(topTrap.exists()).toBe(true)
  expect(topTrap.element.tagName).toBe('SPAN')
  const lastFocusableElement = modal.find('button.btn.btn-primary')
  expect(lastFocusableElement.exists()).toBe(true)
  expect(lastFocusableElement.element.tagName).toBe('BUTTON')

  topTrap.element.focus()
  await topTrap.trigger('focusin')

  expect(document.activeElement).not.toBe(topTrap.element)
  expect(document.activeElement).not.toBe(bottomTrap.element)
  expect(document.activeElement).not.toBe(modalContent.element)
  expect(document.activeElement).toBe(lastFocusableElement.element)

  wrapper.destroy()
})