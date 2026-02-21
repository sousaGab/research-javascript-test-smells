it('Should stop propagating normal event to normal event', (done) => {
  const eventHandlerSpy = jasmine.createSpy('spy');
  const eventHandler = function (event) {
    eventHandlerSpy();
    event.stopPropagation();
  };

  const eventHandlerSpy2 = jasmine.createSpy('spy');
  const eventHandler2 = function () {
    eventHandlerSpy2();
  };

  function SmallComponent() {
    return createElement(
      'div',
      {
        onclick: eventHandler2,
        id: 'parent',
      },
      createElement(
        'div',
        {
          onclick: eventHandler,
          id: 'tester',
        },
        '2',
      ),
    );
  }

  render(<SmallComponent />, container);

  const testerElement = container.querySelector('#tester');
  const parentElement = container.querySelector('#parent');

  // Set up event listeners to detect propagation
  const originalAddEventListener = Element.prototype.addEventListener;
  
  let parentClickCalled = false;
  let testerClickCalled = false;
  
  const mockParentListener = (e) => {
    parentClickCalled = true;
    e.stopPropagation(); // Prevent further propagation
  };
  
  const mockTesterListener = (e) => {
    testerClickCalled = true;
    e.stopPropagation(); // Stop propagation at tester level
  };
  
  // Mock addEventListener to capture event handlers
  spyOn(Element.prototype, 'addEventListener').and.callFake(function (eventName, handler) {
    if (this.id === 'parent') {
      this.addEventListener = originalAddEventListener;
      this.addEventListener(eventName, mockParentListener);
    } else if (this.id === 'tester') {
      this.addEventListener = originalAddEventListener;
      this.addEventListener(eventName, mockTesterListener);
    }
    return originalAddEventListener.apply(this, arguments);
  });

  // Directly call the event handler to avoid timing issues
  const clickEvent = new MouseEvent('click', { bubbles: true });
  testerElement.dispatchEvent(clickEvent);

  // Use nextTick or immediate callback to ensure async operations complete
  queueMicrotask(() => {
    expect(eventHandlerSpy.calls.count()).toBe(1);
    expect(eventHandlerSpy2.calls.count()).toBe(0);
    done();
  });
});