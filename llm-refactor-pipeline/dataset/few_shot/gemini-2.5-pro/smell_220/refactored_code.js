describe('Modal focus trapping', () => {
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
    // Wait for modal to be shown and focus to be applied
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

  it('should focus the modal content on mount', () => {
    const $modal = wrapper.find('div.modal')
    const $content = $modal.find('div.modal-content')

    expect($modal.element.style.display).toEqual('block')
    expect(document.activeElement).toBe($content.element)
  })

  it('should return focus to the modal when an external element is focused', async () => {
    const $button = wrapper.find('#button')
    const $content = wrapper.find('div.modal-content')

    $button.element.focus()
    await $button.trigger('focusin')

    expect(document.activeElement).toBe($content.element)
  })

  it('should focus the first tabbable element when the bottom trap is focused', async () => {
    const $modal = wrapper.find('div.modal')
    const $bottomTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['bottom-trap'])
    const $closeButton = $modal.find('button.close')

    $bottomTrap.element.focus()
    await $bottomTrap.trigger('focusin')

    expect(document.activeElement).toBe($closeButton.element)
  })

  it('should focus the last tabbable element when the top trap is focused', async () => {
    const $modal = wrapper.find('div.modal')
    const $topTrap = createWrapper(wrapper.findComponent(BModal).vm.$refs['top-trap'])
    const $okButton = $modal.find('button.btn.btn-primary')

    $topTrap.element.focus()
    await $topTrap.trigger('focusin')

    expect(document.activeElement).toBe($okButton.element)
  })
})