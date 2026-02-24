it('should trigger sortStart before sortComplete when sorting by name', function (done) {
  let sortStartTriggered = false;
  let sortCompleteTriggered = false;

  list.on('sortStart', function (receivedList) {
    sortStartTriggered = true;
    expect(receivedList).toBe(list);
  });

  list.on('sortComplete', function (receivedList) {
    sortCompleteTriggered = true;
    expect(receivedList).toBe(list);
    expect(sortStartTriggered).toBe(true);
    expect(sortCompleteTriggered).toBe(true);
    done();
  });

  list.sort('name');
});