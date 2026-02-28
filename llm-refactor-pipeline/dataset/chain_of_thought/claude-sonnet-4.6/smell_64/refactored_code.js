it(
        "should suppress onNext method after ModelResponseObserver is onError'ed",
        function() {
            var onNextCalled = false;
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function(value) {
                    onNextCalled = true;
                }
            });
            modelResponseObserver.onError();
            modelResponseObserver.onNext(5);

            expect(onNextCalled).toBe(false);
        }
    )