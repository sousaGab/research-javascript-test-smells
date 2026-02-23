it("measureBeforeMount re-observes element after switching from placeholder to composed component", async function () {
  global.__resizeObservers__ = [];

  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  );

  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: function () {
      return 800;
    }
  });

  try {
    const { container } = render(<BasicLayout measureBeforeMount={true} />);

    const gridLayout = container.querySelector(".react-grid-layout");
    expect(gridLayout).toBeInTheDocument();

    const activeObservers = global.__resizeObservers__.filter(
      obs => obs.observedElements.length > 0
    );
    expect(activeObservers.length).toBeGreaterThan(0);

    const observer = activeObservers[0];
    const observedElement = observer.observedElements[0];
    expect(document.body.contains(observedElement)).toBe(true);

    act(() => {
      global.triggerResize(1000);
    });

    expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
  } finally {
    if (originalOffsetWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetWidth",
        originalOffsetWidth
      );
    }
  }
});