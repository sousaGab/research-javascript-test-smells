it('should have default settings', function () {
      const EXPECTED_LINK_COUNT = 4;
      const EXPECTED_LINK_TEXTS = ['1', '2', '...', '9'];

      const paginationLinks = pagination.find('a');

      expect(paginationLinks.length).toEqual(EXPECTED_LINK_COUNT);

      const actualLinkTexts = paginationLinks.map(function() {
        return this.innerHTML;
      }).get();

      expect(actualLinkTexts).toEqual(EXPECTED_LINK_TEXTS);
    });