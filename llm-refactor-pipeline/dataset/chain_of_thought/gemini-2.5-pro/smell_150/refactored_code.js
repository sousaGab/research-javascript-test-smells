describe('BPagination class rendering when more than 3 pages', () => {
  const defaultProps = {
    totalRows: 70, // 7 pages
    perPage: 10,
    limit: 7
  };

  it('renders correct classes when on the first page', () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...defaultProps,
        value: 1
      }
    });

    expect(wrapper.element.tagName).toBe('UL');
    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11); // 7 pages + 4 bookends
    lis.wrappers.forEach(li => {
      expect(li.classes()).toContain('page-item');
    });

    // Bookend states
    expect(lis.at(0).classes()).toContain('disabled'); // First
    expect(lis.at(1).classes()).toContain('disabled'); // Prev
    expect(lis.at(9).classes()).not.toContain('disabled'); // Next
    expect(lis.at(10).classes()).not.toContain('disabled'); // Last

    // Page button states (indices 2-8)
    expect(lis.at(2).classes()).toContain('active');
    expect(lis.at(2).classes()).not.toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).not.toContain('active');
    expect(lis.at(3).classes()).not.toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).not.toContain('active');
    expect(lis.at(4).classes()).not.toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).not.toContain('active');
    expect(lis.at(5).classes()).toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).not.toContain('active');
    expect(lis.at(6).classes()).toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).not.toContain('active');
    expect(lis.at(7).classes()).toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).not.toContain('active');
    expect(lis.at(8).classes()).toContain('bv-d-xs-down-none'); // Page 7
  });

  it('renders correct classes when on a middle page (page 4)', () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...defaultProps,
        value: 4
      }
    });

    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11);

    // Bookend states
    expect(lis.at(0).classes()).not.toContain('disabled'); // First
    expect(lis.at(1).classes()).not.toContain('disabled'); // Prev
    expect(lis.at(9).classes()).not.toContain('disabled'); // Next
    expect(lis.at(10).classes()).not.toContain('disabled'); // Last

    // Page button states (indices 2-8)
    expect(lis.at(2).classes()).not.toContain('active');
    expect(lis.at(2).classes()).toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).not.toContain('active');
    expect(lis.at(3).classes()).toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).not.toContain('active');
    expect(lis.at(4).classes()).not.toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).toContain('active');
    expect(lis.at(5).classes()).not.toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).not.toContain('active');
    expect(lis.at(6).classes()).not.toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).not.toContain('active');
    expect(lis.at(7).classes()).toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).not.toContain('active');
    expect(lis.at(8).classes()).toContain('bv-d-xs-down-none'); // Page 7
  });

  it('renders correct classes when on the last page (page 7)', () => {
    const wrapper = mount(BPagination, {
      propsData: {
        ...defaultProps,
        value: 7
      }
    });

    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11);

    // Bookend states
    expect(lis.at(0).classes()).not.toContain('disabled'); // First
    expect(lis.at(1).classes()).not.toContain('disabled'); // Prev
    expect(lis.at(9).classes()).toContain('disabled'); // Next
    expect(lis.at(10).classes()).toContain('disabled'); // Last

    // Page button states (indices 2-8)
    expect(lis.at(2).classes()).not.toContain('active');
    expect(lis.at(2).classes()).toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).not.toContain('active');
    expect(lis.at(3).classes()).toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).not.toContain('active');
    expect(lis.at(4).classes()).toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).not.toContain('active');
    expect(lis.at(5).classes()).toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).not.toContain('active');
    expect(lis.at(6).classes()).not.toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).not.toContain('active');
    expect(lis.at(7).classes()).not.toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).toContain('active');
    expect(lis.at(8).classes()).not.toContain('bv-d-xs-down-none'); // Page 7
  });
});