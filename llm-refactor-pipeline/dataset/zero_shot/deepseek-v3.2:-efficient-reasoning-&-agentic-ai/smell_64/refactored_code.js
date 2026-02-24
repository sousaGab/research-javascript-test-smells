it("should suppress onNext method after ModelResponseObserver is onError'ed", function() {
    var wasCalled = false;
    var modelResponseObserver = new ModelResponseObserver({
        onNext: function() {
            wasCalled = true;
        }
    });
    
    modelResponseObserver.onError();
    modelResponseObserver.onNext(5);
    
    expect(wasCalled).toBe(false);
});