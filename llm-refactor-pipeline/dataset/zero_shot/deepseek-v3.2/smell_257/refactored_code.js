it('should be triggered after add', function (done) {
  let eventTriggered = false;
  let eventData = null;
  
  list.on('updated', function (updatedList) {
    eventTriggered = true;
    eventData = updatedList;
    done();
  });
  
  list.add({ name: 'Hej' });
  
  // Add assertion to verify the event was triggered with correct data
  setTimeout(() => {
    if (!eventTriggered) {
      done(new Error('Event was not triggered'));
    }
  }, 100);
});