it('should switch sorting order when clicking multiple times', function (done) {
      let sortRun = 0;
      const sortButton = $('#sort-name');

      list.on('sortComplete', function () {
        sortRun++;
        if (sortRun === 1) {
          expect(sortButton.hasClass('asc')).toBe(true);
          expect(sortButton.hasClass('desc')).toBe(false);
          fireClick(sortButton[0]); // Trigger the second click
        } else if (sortRun === 2) {
          expect(sortButton.hasClass('asc')).toBe(false);
          expect(sortButton.hasClass('desc')).toBe(true);
          fireClick(sortButton[0]); // Trigger the third click
        } else if (sortRun === 3) {
          expect(sortButton.hasClass('asc')).toBe(true);
          expect(sortButton.hasClass('desc')).toBe(false);
          done();
        }
      });

      // Initial state assertion
      expect(sortButton.hasClass('asc')).toBe(false);
      expect(sortButton.hasClass('desc')).toBe(false);

      // Trigger the first click
      fireClick(sortButton[0]);
    });