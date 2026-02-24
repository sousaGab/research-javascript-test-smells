it('shows and hides tooltip on button click with HTML content', async () => {
  jest.useFakeTimers();

  const App = {
    directives: {
      bTooltip: VBTooltip
    },
    template: '<button v-b-tooltip.click.html title="<b>foobar</b>">button</button>'
  };

  const wrapper = mount(App, {
    attachTo: document.body
  });

  const flushAllTimersAndRafs = async vm => {
    await waitNT(vm);
    await waitRAF();
  };

  expect(wrapper.vm).toBeDefined();

  await flushAllTimersAndRafs(wrapper.vm);
  await flushAllTimersAndRafs(wrapper.vm);
  await flushAllTimersAndRafs(wrapper.vm);
  jest.runOnlyPendingTimers();
  await flushAllTimersAndRafs(wrapper.vm);

  expect(wrapper.element.tagName).toBe('BUTTON');
  const $button = wrapper.find('button');

  expect($button.element[BV_TOOLTIP]).toBeDefined();
  expect($button.element[BV_TOOLTIP].$options.name).toBe('BVTooltip');

  expect($button.attributes('aria-describedby')).toBeUndefined();

  await $button.trigger('click');
  await waitRAF();
  await waitRAF();
  jest.runOnlyPendingTimers();
  await flushAllTimersAndRafs(wrapper.vm);

  expect($button.attributes('aria-describedby')).toBeDefined();
  const adb = $button.attributes('aria-describedby');

  const tip = document.querySelector(`#${adb}`);
  expect(tip).not.toBe(null);
  expect(tip.classList.contains('tooltip')).toBe(true);

  wrapper.destroy();
});