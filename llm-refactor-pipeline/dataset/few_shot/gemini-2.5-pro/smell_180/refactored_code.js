test('dispatches complete action when discard throws an exception', async () => {
  const effect = () => Promise.reject();
  const discard = () => {
    throw new Error();
  };
  const { action, config, dispatch } = setup({ effect, discard });

  await send(action, dispatch, config);

  const { rollback } = action.meta.offline;
  expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
  expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
});