test('dispatches complete action when discard throw an exception', async () => {
  const effect = () => Promise.reject();
  const discard = () => {
    throw new Error();
  };
  const { action, config, dispatch } = setup({ effect, discard });
  const { rollback } = action.meta.offline;

  await send(action, dispatch, config);

  expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
  expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
});