describe('BVTooltip directive', () => {
  const createAppComponent = () => ({
    directives: {
      bTooltip: VBTooltip
    },
    template: '<button v-b-tooltip.click.html title="<b>foobar</b>">button</button>'
  });

  const mountAppWithTooltip = () =>
    mount(createAppComponent(), {
      attachTo: document.body
    });

  const flushTooltipTimersAndUpdates = async vm => {
    await waitNT(vm);
    await waitRAF();
    await waitNT(vm);
    await waitRAF();
    await waitNT(vm);
    await waitRAF();
    jest.runOnlyPendingTimers();
    await waitNT(vm);
    await waitRAF();
  };

  const triggerTooltipClickAndFlush = async (buttonWrapper, vm) => {
    await buttonWrapper.trigger('click');
    await waitRAF();
    await waitRAF();
    jest.runOnlyPendingTimers();
    await waitNT(vm);
    await waitRAF();
  };

  it('should show tooltip on click', async () => {
    jest.useFakeTimers();

    const wrapper = mountAppWithTooltip();

    expect(wrapper.vm).toBeDefined();

    await flushTooltipTimersAndUpdates(wrapper.vm);

    expect(wrapper.element.tagName).toBe('BUTTON');
    const $button = wrapper.find('button');

    expect($button.element[BV_TOOLTIP]).toBeDefined();
    expect($button.element[BV_TOOLTIP].$options.name).toBe('BVTooltip');

    expect($button.attributes('aria-describedby')).toBeUndefined();

    await triggerTooltipClickAndFlush($button, wrapper.vm);

    expect($button.attributes('aria-describedby')).toBeDefined();
    const adb = $button.attributes('aria-describedby');

    const tip = document.querySelector(`#${adb}`);
    expect(tip).not.toBe(null);
    expect(tip.classList.contains('tooltip')).toBe(true);

    wrapper.destroy();
  });
})