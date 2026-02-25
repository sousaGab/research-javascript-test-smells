test('dispatches complete action when discard throw an exception', async () => {
  const effect = jest.fn().mockRejectedValue(new Error());
  const discard = jest.fn().mockImplementationThrow(new Error());
  const { action, config, dispatch } = setup({ effect, discard });

  await send(action, dispatch, config);

  const { rollback } = action.meta.offline;
  expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
  expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
});