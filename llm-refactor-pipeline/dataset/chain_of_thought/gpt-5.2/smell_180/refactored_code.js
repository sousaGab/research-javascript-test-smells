// Your COMPLETE refactored test code here
test('dispatches complete action when discard throw an exception', async () => {
  const effect = () => Promise.reject();
  const discard = () => {
    throw new Error();
  };
  const { action, config, dispatch } = setup({ effect, discard });

  const { rollback } = action.meta.offline;

  expect.assertions(2);

  await expect(send(action, dispatch, config)).resolves.toBeDefined();

  expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
  expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
});