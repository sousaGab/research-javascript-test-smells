it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    var modelResponseObserver = new ModelResponseObserver({
        onNext: function(value) {
            expect(value).toBe(undefined);
        }
    });
    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);
});