it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    const modelResponseObserver = new ModelResponseObserver({
        onNext: function(value) {
            onNextValue = value;
        }
    });
    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);

    expect(onNextValue).toBe(undefined);
});