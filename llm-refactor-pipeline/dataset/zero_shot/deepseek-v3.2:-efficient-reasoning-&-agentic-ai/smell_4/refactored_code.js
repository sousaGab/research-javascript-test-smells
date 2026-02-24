it("makes a couple requests where only part of the second request is deduped then first request is disposed", done => {
    const scheduler = new ImmediateScheduler();
    const source = new LocalDataSource(Cache(), { wait: 100 });
    const model = new Model({ source });
    const queue = new RequestQueue(model, scheduler);

    const zip = zipSpy(
        2,
        callCount => {
            expect(callCount).toBe(1);

            const onNext = jest.fn();
            toObservable(model.withoutDataSource().get(videos0, videos1))
                .doAction(onNext, noOp, () => {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0"
                                },
                                1: {
                                    title: "Video 1"
                                }
                            }
                        }
                    });
                })
                .subscribe(noOp, done, done);
        },
        300
    );

    const disposable = queue.get([videos0], [videos0], zip);
    expect(queue._requests.length).toBe(1);
    expect(queue._requests[0].sent).toBe(true);
    expect(queue._requests[0].scheduled).toBe(false);

    queue.get([videos0, videos1], [videos0, videos1], zip);
    expect(queue._requests.length).toBe(2);
    queue._requests.forEach(request => {
        expect(request.sent).toBe(true);
        expect(request.scheduled).toBe(false);
    });

    disposable();
})