it(
        "should suppress onNext method after ModelResponseObserver is onError'ed",
        function() {
            var onNext = jest.fn();
            var modelResponseObserver = new ModelResponseObserver({
                onNext: onNext
            });
            modelResponseObserver.onError();
            modelResponseObserver.onNext(5);

            expect(onNext).not.toHaveBeenCalled();
        }
    )