it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    var onNext = jasmine.createSpy("onNext");
    var modelResponseObserver = new ModelResponseObserver({ onNext: onNext });

    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);

    expect(onNext).not.toHaveBeenCalled();
});