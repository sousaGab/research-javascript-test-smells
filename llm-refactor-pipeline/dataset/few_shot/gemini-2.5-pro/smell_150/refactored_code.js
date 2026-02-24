describe('BPagination', () => {
  const baseProps = {
    totalRows: 70,
    perPage: 10,
    limit: 7,
  };

  describe('renders classes bv-d-xs-down-none when more than 3 pages', () => {
    it('when on the first page', async () => {
      const wrapper = mount(BPagination, {
        propsData: { ...baseProps,
          value: 1
        }
      });

      expect(wrapper.element.tagName).toBe('UL');
      const lis = wrapper.findAll('li').wrappers;
      expect(lis.length).toBe(11);

      const expectedDisabled = [true, true, false, false, false, false, false, false, false, false, false];
      const expectedActive = [false, false, true, false, false, false, false, false, false, false, false];
      const expectedHidden = [false, false, false, false, false, true, true, true, true, false, false];

      lis.forEach((li, index) => {
        expect(li.classes()).toContain('page-item');
        expect(li.classes().includes('disabled')).toBe(expectedDisabled[index]);
        expect(li.classes().includes('active')).toBe(expectedActive[index]);
        expect(li.classes().includes('bv-d-xs-down-none')).toBe(expectedHidden[index]);
      });

      wrapper.destroy();
    });

    it('when on a middle page', async () => {
      const wrapper = mount(BPagination, {
        propsData: { ...baseProps,
          value: 4
        }
      });

      const lis = wrapper.findAll('li').wrappers;
      expect(lis.length).toBe(11);

      const expectedDisabled = [false, false, false, false, false, false, false, false, false, false, false];
      const expectedActive = [false, false, false, false, false, true, false, false, false, false, false];
      const expectedHidden = [false, false, true, true, false, false, false, true, true, false, false];

      lis.forEach((li, index) => {
        expect(li.classes()).toContain('page-item');
        expect(li.classes().includes('disabled')).toBe(expectedDisabled[index]);
        expect(li.classes().includes('active')).toBe(expectedActive[index]);
        expect(li.classes().includes('bv-d-xs-down-none')).toBe(expectedHidden[index]);
      });

      wrapper.destroy();
    });

    it('when on the last page', async () => {
      const wrapper = mount(BPagination, {
        propsData: { ...baseProps,
          value: 7
        }
      });

      const lis = wrapper.findAll('li').wrappers;
      expect(lis.length).toBe(11);

      // Mapping: [First, Prev, P1, P2, P3, P4, P5, P6, P7, Next, Last]
      const expectedHidden = [false, false, true, true, true, true, false, false, false, false, false];

      lis.forEach((li, index) => {
        expect(li.classes()).toContain('page-item');
        expect(li.classes().includes('bv-d-xs-down-none')).toBe(expectedHidden[index]);
      });

      wrapper.destroy();
    });
  });
});