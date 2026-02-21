it('should trigger sortComplete', function () {
  const sortCompleteSpy = jest.spyOn(list, 'sortComplete');
  fireClick($('#sort-name')[0]);
  expect(sortCompleteSpy).toHaveBeenCalled();
});