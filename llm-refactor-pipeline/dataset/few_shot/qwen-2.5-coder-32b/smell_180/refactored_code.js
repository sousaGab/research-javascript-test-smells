test('dispatches complete action when discard throw an exception', () => {
    const effect = () => Promise.reject();
    const discard = () => {throw new Error()};
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, config);

    const { rollback } = action.meta.offline;
    expect.assertions(2);
    return promise.catch(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  })