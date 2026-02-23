it('should have default settings', function () {
      const expectedPageLinks = ['1', '2', '...', '9'];
      const actualPageLinks = pagination.find('a').map((index, element) => element.innerHTML).get();

      expect(actualPageLinks).toEqual(expectedPageLinks);
    })