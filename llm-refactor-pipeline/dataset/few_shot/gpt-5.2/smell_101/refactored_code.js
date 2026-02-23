it('should show a tooltip with HTML content when the button is clicked', async () => {
  jest.useFakeTimers()

  const App = {
    directives: {
      bTooltip: VBTooltip
    },
    template: '<button v-b-tooltip.click.html title="<b>foobar</b>">button</button>'
  }

  const wrapper = mount(App, { attachTo: document.body })

  const flushTooltipLifecycle = async () => {
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  const flushAfterMount = async () => {
    await flushTooltipLifecycle()
    await flushTooltipLifecycle()
    await flushTooltipLifecycle()
    jest.runOnlyPendingTimers()
    await flushTooltipLifecycle()
  }

  const flushAfterTrigger = async () => {
    await waitRAF()
    await waitRAF()
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  expect(wrapper.vm).toBeDefined()
  await flushAfterMount()

  expect(wrapper.element.tagName).toBe('BUTTON')
  const $button = wrapper.find('button')

  expect($button.element[BV_TOOLTIP]).toBeDefined()
  expect($button.element[BV_TOOLTIP].$options.name).toBe('BVTooltip')

  expect($button.attributes('aria-describedby')).toBeUndefined()

  await $button.trigger('click')
  await flushAfterTrigger()

  expect($button.attributes('aria-describedby')).toBeDefined()
  const adb = $button.attributes('aria-describedby')

  const tip = document.querySelector(`#${adb}`)
  expect(tip).not.toBe(null)
  expect(tip.classList.contains('tooltip')).toBe(true)

  wrapper.destroy()
})