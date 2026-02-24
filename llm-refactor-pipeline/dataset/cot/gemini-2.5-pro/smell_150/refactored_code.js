describe('responsive class "bv-d-xs-down-none"', () => {
  const baseProps = {
    totalRows: 70,
    perPage: 10,
    limit: 7,
  };

  it('applies correct classes when on first page', async () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...baseProps,
        value: 1
      }
    });

    expect(wrapper.element.tagName).toBe('UL');
    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11); // 7 pages + 4 bookends

    const expectedStates = [
      // { text: '«', disabled, active, responsive }
      {
        disabled: true,
        active: false,
        responsive: false
      }, // First
      {
        disabled: true,
        active: false,
        responsive: false
      }, // Prev
      {
        disabled: false,
        active: true,
        responsive: false
      }, // Page 1
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 2
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 3
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 4
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 5
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 6
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 7
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Next
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Last
    ];

    lis.wrappers.forEach((li, i) => {
      const state = expectedStates[i];
      const classes = li.classes();
      expect(classes.includes('disabled')).toBe(state.disabled);
      expect(classes.includes('active')).toBe(state.active);
      expect(classes.includes('bv-d-xs-down-none')).toBe(state.responsive);
    });

    wrapper.destroy();
  });

  it('applies correct classes when on a middle page', async () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...baseProps,
        value: 4
      }
    });

    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11);

    const expectedStates = [
      // { text: '«', disabled, active, responsive }
      {
        disabled: false,
        active: false,
        responsive: false
      }, // First
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Prev
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 1
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 2
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 3
      {
        disabled: false,
        active: true,
        responsive: false
      }, // Page 4
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 5
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 6
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 7
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Next
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Last
    ];

    lis.wrappers.forEach((li, i) => {
      const state = expectedStates[i];
      const classes = li.classes();
      expect(classes.includes('disabled')).toBe(state.disabled);
      expect(classes.includes('active')).toBe(state.active);
      expect(classes.includes('bv-d-xs-down-none')).toBe(state.responsive);
    });

    wrapper.destroy();
  });

  it('applies correct classes when on last page', async () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...baseProps,
        value: 7
      }
    });

    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11);

    const expectedStates = [
      // { text: '«', disabled, active, responsive }
      {
        disabled: false,
        active: false,
        responsive: false
      }, // First
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Prev
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 1
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 2
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 3
      {
        disabled: false,
        active: false,
        responsive: true
      }, // Page 4
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 5
      {
        disabled: false,
        active: false,
        responsive: false
      }, // Page 6
      {
        disabled: false,
        active: true,
        responsive: false
      }, // Page 7
      {
        disabled: true,
        active: false,
        responsive: false
      }, // Next
      {
        disabled: true,
        active: false,
        responsive: false
      }, // Last
    ];

    lis.wrappers.forEach((li, i) => {
      const state = expectedStates[i];
      const classes = li.classes();
      expect(classes.includes('disabled')).toBe(state.disabled);
      expect(classes.includes('active')).toBe(state.active);
      expect(classes.includes('bv-d-xs-down-none')).toBe(state.responsive);
    });

    wrapper.destroy();
  });
});