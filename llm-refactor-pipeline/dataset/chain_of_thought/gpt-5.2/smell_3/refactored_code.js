// Your COMPLETE refactored test code here
it("makes a couple requests where only part of the second request is deduped then disposed", done => {
    const scheduler = new ImmediateScheduler();
    const source = new LocalDataSource(Cache(), { wait: 100 });
    const model = new Model({ source });
    const queue = new RequestQueue(model, scheduler);

    const expectRequestState = (index, { sent, scheduled }) => {
        expect(queue._requests[index]).toEqual(
            expect.objectContaining({
                sent,
                scheduled
            })
        );
    };

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
    expectRequestState(0, { sent: true, scheduled: false });

    const disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
    expect(queue._requests.length).toBe(2);
    expectRequestState(1, { sent: true, scheduled: false });

    disposable2();
});