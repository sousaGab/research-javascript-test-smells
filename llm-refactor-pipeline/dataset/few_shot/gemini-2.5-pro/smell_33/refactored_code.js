it('should have default settings', function () {
      const EXPECTED_LINK_TEXTS = ['1', '2', '...', '9'];
      const links = pagination.find('a');

      const actualLinkTexts = links.map((index, el) => el.innerHTML).get();

      expect(actualLinkTexts).toEqual(EXPECTED_LINK_TEXTS);
    })