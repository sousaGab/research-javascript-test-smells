it('should trigger both handlers', function (done) {
  const handler1 = sinon.spy();
  const handler2 = sinon.spy();
  let callCount = 0;

  const allHandlersCalled = () => {
    callCount++;
    if (callCount === 2) {
      sinon.assert.calledOnce(handler1);
      sinon.assert.calledOnce(handler2);
      done();
    }
  };

  list.on('updated', () => {
    handler1();
    allHandlersCalled();
  });

  list.on('updated', () => {
    handler2();
    allHandlersCalled();
  });

  list.search('jonny');
});