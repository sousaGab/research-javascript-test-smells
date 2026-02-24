it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const assertEmittedEvents = (carousel, expected) => {
    const events = ['sliding-start', 'sliding-end', 'input'];
    events.forEach(event => {
      const emitted = carousel.emitted(event);
      const expectedEmissions = expected[event];

      if (expectedEmissions) {
        expect(emitted).toEqual(expectedEmissions);
      } else {
        expect(emitted).toBeUndefined();
      }
    });
  };

  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  });

  const $carousel = wrapper.findComponent(BCarousel);

  await waitNT(wrapper.vm);
  await waitRAF();

  assertEmittedEvents($carousel, {});

  await $carousel.trigger('keydown.right');

  assertEmittedEvents($carousel, {
    'sliding-start': [
      [1]
    ]
  });

  jest.runOnlyPendingTimers();
  await waitNT(wrapper.vm);
  await waitRAF();

  assertEmittedEvents($carousel, {
    'sliding-start': [
      [1]
    ],
    'sliding-end': [
      [1]
    ],
    'input': [
      [1]
    ]
  });

  await $carousel.trigger('keydown.left');

  assertEmittedEvents($carousel, {
    'sliding-start': [
      [1],
      [0]
    ],
    'sliding-end': [
      [1]
    ],
    'input': [
      [1]
    ]
  });

  jest.runOnlyPendingTimers();
  await waitNT(wrapper.vm);
  await waitRAF();

  assertEmittedEvents($carousel, {
    'sliding-start': [
      [1],
      [0]
    ],
    'sliding-end': [
      [1],
      [0]
    ],
    'input': [
      [1],
      [0]
    ]
  });

  wrapper.destroy();
});