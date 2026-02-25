it(
    "should suppress onNext method after ModelResponseObserver is onError'ed",
    function() {
        const onNextSpy = jest.fn();
        const modelResponseObserver = new ModelResponseObserver({
            onNext: onNextSpy
        });

        modelResponseObserver.onError();
        modelResponseObserver.onNext(5);

        expect(onNextSpy).not.toHaveBeenCalled();
    }
)