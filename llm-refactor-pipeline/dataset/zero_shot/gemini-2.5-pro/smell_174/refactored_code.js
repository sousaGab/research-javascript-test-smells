it("should be able to dispose of getRequests.", done => {
    const onGet = jest.fn();
    const source = new LocalDataSource(cacheGenerator(0, 2), {
        onGet
    });
    const model = new Model({
        source
    }).batch();
    const onNext = jest.fn();
    const disposable = toObservable(model.
        get(["videos", 0, "title"])).
    doAction(onNext, noOp, () => {
        done.fail("Should not of completed. It was disposed.");
    }).
    subscribe(noOp, done);


    disposable.dispose();
    setTimeout(() => {
        expect(onNext).not.toHaveBeenCalled();
        expect(onGet).not.toHaveBeenCalled();
        done();
    }, 200);
});