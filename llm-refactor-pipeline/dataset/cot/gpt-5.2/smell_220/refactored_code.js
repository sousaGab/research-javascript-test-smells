it('if focus leaves modal it returns to modal', async () => {
  const App = {
    render(h) {
      return h('div', [
        h('button', { attrs: { id: 'button', type: 'button' } }, 'Button'),
        h(BModal, { props: { static: true, id: 'test', visible: true } }, 'Modal content')
      ])
    }
  }

  const wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.vm).toBeDefined()

  const settle = async () => {
    for (let i = 0; i < 4; i++) {
      await waitNT(wrapper.vm)
      await waitRAF()
    }
  }

  const expectFocusable = ($el, tagName) => {
    expect($el.exists()).toBe(true)
    expect($el.element.tagName).toBe(tagName)
  }

  const focusAndExpectActive = async ({ $target, $trigger, notActive = [], active }) => {
    $target.element.focus()
    await $trigger.trigger('focusin')
    notActive.forEach((el) => expect(document.activeElement).not.toBe(el))
    expect(document.activeElement).toBe(active)
  }

  await settle()

  const $button = wrapper.find('#button')
  expectFocusable($button, 'BUTTON')

  const $modal = wrapper.find('div.modal')
  expect($modal.exists()).toBe(true)

  const $content = $modal.find('div.modal-content')
  expect($content.exists()).toBe(true)

  expect($modal.element.style.display).toEqual('block')
  expect(document.activeElement).not.toBe(document.body)
  expect(document.activeElement).toBe($content.element)

  await focusAndExpectActive({
    $target: $button,
    $trigger: $button,
    notActive: [$button.element],
    active: $content.element
  })

  const modalVm = wrapper.findComponent(BModal).vm

  const $bottomTrap = createWrapper(modalVm.$refs['bottom-trap'])
  expectFocusable($bottomTrap, 'SPAN')

  const $closeButton = $modal.find('button.close')
  expectFocusable($closeButton, 'BUTTON')

  await focusAndExpectActive({
    $target: $bottomTrap,
    $trigger: $bottomTrap,
    notActive: [$bottomTrap.element, $content.element],
    active: $closeButton.element
  })

  const $topTrap = createWrapper(modalVm.$refs['top-trap'])
  expectFocusable($topTrap, 'SPAN')

  const $okButton = $modal.find('button.btn.btn-primary')
  expectFocusable($okButton, 'BUTTON')

  await focusAndExpectActive({
    $target: $topTrap,
    $trigger: $topTrap,
    notActive: [$topTrap.element, $bottomTrap.element, $content.element],
    active: $okButton.element
  })

  wrapper.destroy()
})