describe('BModal focus management', () => {
  let wrapper
  let App
  let externalButton
  let modalContent
  let closeButton
  let okButton
  let topTrap
  let bottomTrap

  beforeEach(async () => {
    App = {
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
    wrapper = mount(App, {
      attachTo: document.body
    })

    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    const modalWrapper = wrapper.findComponent(BModal)
    externalButton = wrapper.find('#button')
    modalContent = modalWrapper.find('div.modal-content')
    closeButton = modalWrapper.find('button.close')
    okButton = modalWrapper.find('button.btn.btn-primary')
    topTrap = createWrapper(modalWrapper.vm.$refs['top-trap'])
    bottomTrap = createWrapper(modalWrapper.vm.$refs['bottom-trap'])
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should focus the modal content on open', () => {
    expect(document.activeElement).toBe(modalContent.element)
  })

  it('should return focus to the modal when an external element is focused', async () => {
    externalButton.element.focus()
    await externalButton.trigger('focusin')

    expect(document.activeElement).not.toBe(externalButton.element)
    expect(document.activeElement).toBe(modalContent.element)
  })

  it('should wrap focus to the first element when tabbing from the last', async () => {
    bottomTrap.element.focus()
    await bottomTrap.trigger('focusin')

    expect(document.activeElement).toBe(closeButton.element)
  })

  it('should wrap focus to the last element when shift-tabbing from the first', async () => {
    topTrap.element.focus()
    await topTrap.trigger('focusin')

    expect(document.activeElement).toBe(okButton.element)
  })
})