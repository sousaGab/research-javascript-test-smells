it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    const onNextSpy = jasmine.createSpy('onNext');
    const modelResponseObserver = new ModelResponseObserver({
        onNext: onNextSpy
    });

    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);

    expect(onNextSpy).not.toHaveBeenCalled();
});