it("should be able to dispose of getRequests.", () => {
    const onGet = jest.fn();
    const source = new LocalDataSource(cacheGenerator(0, 2), {
        onGet
    });
    const model = new Model({ source }).batch();
    const onNext = jest.fn();
    const disposable = toObservable(
        model.get(["videos", 0, "title"])
    )
        .doAction(onNext, noOp, () => {
            throw new Error("Should not of completed.  It was disposed.");
        })
        .subscribe(noOp, noOp);

    disposable.dispose();

    jest.advanceTimersByTime(200);

    expect(onNext).not.toHaveBeenCalled();
    expect(onGet).not.toHaveBeenCalled();
});