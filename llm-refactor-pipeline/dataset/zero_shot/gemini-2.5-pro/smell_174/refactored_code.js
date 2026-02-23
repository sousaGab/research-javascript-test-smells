it("should be able to dispose of getRequests.", async () => {
    const onGet = jest.fn();
    const source = new LocalDataSource(cacheGenerator(0, 2), {
        onGet
    });
    const model = new Model({
        source
    }).batch();
    const onNext = jest.fn();
    const onError = jest.fn();
    const onCompleted = jest.fn();

    const disposable = toObservable(model.get(["videos", 0, "title"]))
        .subscribe(onNext, onError, onCompleted);

    disposable.dispose();

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(onNext).not.toHaveBeenCalled();
    expect(onGet).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onCompleted).not.toHaveBeenCalled();
});