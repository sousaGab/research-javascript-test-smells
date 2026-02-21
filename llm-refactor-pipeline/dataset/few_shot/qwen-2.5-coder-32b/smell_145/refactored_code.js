it('should switch sorting order when clicking multiple times', function (done) {
  var sortRun = 0;
  var sortHandler = function () {
    sortRun++;
    if (sortRun === 1) {
      expect($('#sort-name').hasClass('asc')).toBe(true);
      expect($('#sort-name').hasClass('desc')).toBe(false);
      fireClick($('#sort-name')[0]);
    } else if (sortRun === 2) {
      expect($('#sort-name').hasClass('asc')).toBe(false);
      expect($('#sort-name').hasClass('desc')).toBe(true);
      fireClick($('#sort-name')[0]);
    } else if (sortRun === 3) {
      expect($('#sort-name').hasClass('asc')).toBe(true);
      expect($('#sort-name').hasClass('desc')).toBe(false);
      list.removeListener('sortComplete', sortHandler);
      done();
    }
  };

  list.on('sortComplete', sortHandler);
  
  expect($('#sort-name').hasClass('asc')).toBe(false);
  expect($('#sort-name').hasClass('desc')).toBe(false);
  fireClick($('#sort-name')[0]);
});