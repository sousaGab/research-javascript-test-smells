it('should have default settings', function () {
      const EXPECTED_LINK_TEXTS = ['1', '2', '...', '9'];
      const EXPECTED_NUMBER_OF_LINKS = EXPECTED_LINK_TEXTS.length;

      const links = pagination.find('a');
      const actualLinkTexts = links.map((i, el) => el.innerHTML).get();

      expect(links.length).toEqual(EXPECTED_NUMBER_OF_LINKS);
      expect(actualLinkTexts).toEqual(EXPECTED_LINK_TEXTS);
      expect(links.get(EXPECTED_NUMBER_OF_LINKS)).toBeUndefined();
    })