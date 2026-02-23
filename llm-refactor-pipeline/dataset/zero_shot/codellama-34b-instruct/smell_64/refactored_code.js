it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    const modelResponseObserver = new ModelResponseObserver({
        onNext: jest.fn()
    });
    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);

    expect(modelResponseObserver.onNext).not.toHaveBeenCalled();
});