it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    var modelResponseObserver = new ModelResponseObserver({
        onNext: function(value) {
            expect(value).toBeUndefined();
        }
    });
    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);
});