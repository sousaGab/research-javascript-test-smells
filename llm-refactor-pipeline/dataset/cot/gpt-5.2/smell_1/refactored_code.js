// Your COMPLETE refactored test code here
it('should error on a shorted deref path.', function(done) {
    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    var onNext = jest.fn();
    model.get(['lolomo', 0, 0, 'item', 'title']).subscribe(onNext, noOp, function() {
        expect(onNext).toHaveBeenCalledTimes(1);

        var json = onNext.mock.calls[0][0].json;
        var lolomoModel = model.deref(json.lolomo);
        model
            .set({
                json: {
                    lolomos: 'ohh no'
                }
            })
            .subscribe();

        toObservable(lolomoModel.get([0, 0, 'item', 'title']))
            .doAction(
                onNext,
                function(err) {
                    expect(err.name).toBe(InvalidModelError.name);
                }
            )
            .subscribe(
                noOp,
                function(err) {
                    if (isAssertionError(err)) {
                        return done(err);
                    }
                    done();
                },
                done.bind(null, new Error('onCompleted shouldnt be called'))
            );
    });
});