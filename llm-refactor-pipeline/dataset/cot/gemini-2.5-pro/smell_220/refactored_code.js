describe('BModal focus trapping', () => {
  let wrapper
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

  beforeEach(async () => {
    wrapper = mount(App, {
      attachTo: document.body
    })
    // Wait for modal to be shown and for focus to be transferred
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('returns focus to the modal when an outside element is focused', async () => {
    const $button = wrapper.find('#button')
    expect($button.exists()).toBe(true)
    const $content = wrapper.find('div.modal-content')
    expect($content.exists()).toBe(true)

    expect(document.activeElement).toBe($content.element)

    $button.element.focus()
    await $button.trigger('focusin')

    expect(document.activeElement).not.toBe($button.element)
    expect(document.activeElement).toBe($content.element)
  })

  it('wraps focus to the start when tabbing forward from the end', async () => {
    const $modal = wrapper.find('div.modal')
    const $closeButton = $modal.find('button.close')
    expect($closeButton.exists()).toBe(true)
    const $bottomTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['bottom-trap'])
    expect($bottomTrap.exists()).toBe(true)

    $bottomTrap.element.focus()
    await $bottomTrap.trigger('focusin')

    expect(document.activeElement).toBe($closeButton.element)
  })

  it('wraps focus to the end when tabbing backward from the start', async () => {
    const $modal = wrapper.find('div.modal')
    const $okButton = $modal.find('button.btn.btn-primary')
    expect($okButton.exists()).toBe(true)
    const $topTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['top-trap'])
    expect($topTrap.exists()).toBe(true)

    $topTrap.element.focus()
    await $topTrap.trigger('focusin')

    expect(document.activeElement).toBe($okButton.element)
  })
})