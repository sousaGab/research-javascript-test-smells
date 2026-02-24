it("makes a couple requests where only part of the second request is deduped then disposed", done => {
        const assertRequestState = (queue, index, expectedLength) => {
            expect(queue._requests.length).toBe(expectedLength);
            expect(queue._requests[index].sent).toBe(true);
            expect(queue._requests[index].scheduled).toBe(false);
        };

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
        assertRequestState(queue, 0, 1);

        const disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
        assertRequestState(queue, 1, 2);

        disposable2();
    })