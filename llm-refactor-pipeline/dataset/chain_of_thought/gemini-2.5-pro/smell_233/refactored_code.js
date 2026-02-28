it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers();

  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  });

  const assertCountdownEvent = (index, value) => {
    const events = wrapper.emitted('dismiss-count-down');
    expect(events).toHaveLength(index + 1);
    expect(events[index][0]).toBe(value);
  };

  const advanceOneSecond = async () => {
    jest.runTimersToTime(1000);
    await waitNT(wrapper.vm);
  };

  expect(wrapper.vm).toBeDefined();
  await waitNT(wrapper.vm);

  // Initial countdown from 2
  expect(wrapper.emitted('dismissed')).toBeUndefined();
  assertCountdownEvent(0, 2); // Initial emit

  await advanceOneSecond();
  assertCountdownEvent(1, 1); // After 1 sec

  // Reset countdown to 3
  await wrapper.setProps({
    show: 3
  });
  assertCountdownEvent(2, 3); // Reset emit

  // Countdown from 3 down to 0
  const initialEventCount = 3;
  const countdownFrom = 3;
  for (let i = 0; i < countdownFrom; i++) {
    await advanceOneSecond();
    const expectedEventIndex = initialEventCount + i;
    const expectedValue = countdownFrom - 1 - i;
    assertCountdownEvent(expectedEventIndex, expectedValue);
  }

  // Final checks
  jest.runAllTimers();
  await waitNT(wrapper.vm);

  // No more countdown events should be emitted
  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(6);

  await waitRAF();
  expect(wrapper.emitted('dismissed')).toHaveLength(1);
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE);

  wrapper.destroy();
});