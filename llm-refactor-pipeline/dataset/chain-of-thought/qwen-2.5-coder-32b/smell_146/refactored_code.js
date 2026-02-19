it('Should stop propagating normal event to normal event', () => {
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
      testerElement.click();

      // Use fake timers to avoid sleep
      jasmine.clock().install();
      try {
        jasmine.clock().tick(20);
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(eventHandlerSpy2.calls.count()).toBe(0);
      } finally {
        jasmine.clock().uninstall();
      }
    });