describe('BPagination class rendering', () => {
  const mountPagination = (props = {}) => {
    const defaultProps = {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    };
    return mount(BPagination, {
      propsData: { ...defaultProps,
        ...props
      }
    });
  };

  it('renders classes correctly when on the first page', async () => {
    const wrapper = mountPagination({
      value: 1
    });

    expect(wrapper.element.tagName).toBe('UL');
    const lis = wrapper.findAll('li');
    expect(lis.length).toBe(11);
    expect(wrapper.vm.computedCurrentPage).toBe(1);

    // Bookend button states
    expect(lis.at(0).classes()).toContain('disabled'); // First
    expect(lis.at(1).classes()).toContain('disabled'); // Prev
    expect(lis.at(9).classes()).not.toContain('disabled'); // Next
    expect(lis.at(10).classes()).not.toContain('disabled'); // Last

    // Active page states
    expect(lis.at(2).classes()).toContain('active'); // Page 1
    expect(lis.at(3).classes()).not.toContain('active');
    expect(lis.at(4).classes()).not.toContain('active');
    expect(lis.at(5).classes()).not.toContain('active');
    expect(lis.at(6).classes()).not.toContain('active');
    expect(lis.at(7).classes()).not.toContain('active');
    expect(lis.at(8).classes()).not.toContain('active');

    // Visibility classes
    expect(lis.at(2).classes()).not.toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).not.toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).not.toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).toContain('bv-d-xs-down-none'); // Page 7

    wrapper.destroy();
  });

  it('renders classes correctly when on a middle page', async () => {
    const wrapper = mountPagination({
      value: 4
    });
    await waitNT(wrapper.vm);

    const lis = wrapper.findAll('li');
    expect(wrapper.vm.computedCurrentPage).toBe(4);

    // Bookend button states
    expect(lis.at(0).classes()).not.toContain('disabled'); // First
    expect(lis.at(1).classes()).not.toContain('disabled'); // Prev
    expect(lis.at(9).classes()).not.toContain('disabled'); // Next
    expect(lis.at(10).classes()).not.toContain('disabled'); // Last

    // Active page states
    expect(lis.at(2).classes()).not.toContain('active');
    expect(lis.at(3).classes()).not.toContain('active');
    expect(lis.at(4).classes()).not.toContain('active');
    expect(lis.at(5).classes()).toContain('active'); // Page 4
    expect(lis.at(6).classes()).not.toContain('active');
    expect(lis.at(7).classes()).not.toContain('active');
    expect(lis.at(8).classes()).not.toContain('active');

    // Visibility classes
    expect(lis.at(2).classes()).toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).not.toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).not.toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).not.toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).toContain('bv-d-xs-down-none'); // Page 7

    wrapper.destroy();
  });

  it('renders classes correctly when on the last page', async () => {
    const wrapper = mountPagination({
      value: 7
    });
    await waitNT(wrapper.vm);

    const lis = wrapper.findAll('li');
    expect(wrapper.vm.computedCurrentPage).toBe(7);

    // Visibility classes
    expect(lis.at(2).classes()).toContain('bv-d-xs-down-none'); // Page 1
    expect(lis.at(3).classes()).toContain('bv-d-xs-down-none'); // Page 2
    expect(lis.at(4).classes()).toContain('bv-d-xs-down-none'); // Page 3
    expect(lis.at(5).classes()).toContain('bv-d-xs-down-none'); // Page 4
    expect(lis.at(6).classes()).not.toContain('bv-d-xs-down-none'); // Page 5
    expect(lis.at(7).classes()).not.toContain('bv-d-xs-down-none'); // Page 6
    expect(lis.at(8).classes()).not.toContain('bv-d-xs-down-none'); // Page 7

    wrapper.destroy();
  });
});