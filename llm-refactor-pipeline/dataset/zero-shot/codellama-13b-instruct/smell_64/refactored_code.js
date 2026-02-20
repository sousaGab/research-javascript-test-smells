it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
  var modelResponseObserver = new ModelResponseObserver();
  modelResponseObserver.onError();
  modelResponseObserver.onNext(5);

  expect(modelResponseObserver.onNext).not.toHaveBeenCalled();
});