it("makes a couple requests where only part of the second request is deduped then disposed", done => {
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
                                }
                            }
                        }
                    });
                })
                .subscribe(noOp, done, done);
        },
        300
    );

    queue.get([videos0], [videos0], zip);
    
    expect(queue._requests.length).toBe(1);
    const firstRequest = queue._requests[0];
    expect(firstRequest.sent).toBe(true);
    expect(firstRequest.scheduled).toBe(false);

    const disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
    
    expect(queue._requests.length).toBe(2);
    const secondRequest = queue._requests[1];
    expect(secondRequest.sent).toBe(true);
    expect(secondRequest.scheduled).toBe(false);

    disposable2();
})