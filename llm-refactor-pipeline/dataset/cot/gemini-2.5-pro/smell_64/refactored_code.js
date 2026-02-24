it(
    "should suppress onNext method after ModelResponseObserver is onError'ed",
    function() {
        var onNextSpy = jasmine.createSpy('onNext');
        var modelResponseObserver = new ModelResponseObserver({
            onNext: onNextSpy
        });

        modelResponseObserver.onError();
        modelResponseObserver.onNext(5);

        expect(onNextSpy).not.toHaveBeenCalled();
    }
)