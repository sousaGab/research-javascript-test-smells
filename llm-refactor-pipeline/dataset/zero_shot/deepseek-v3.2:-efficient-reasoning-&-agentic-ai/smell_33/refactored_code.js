it('should have default settings', function () {
  const links = pagination.find('a');
  const expectedLinkCount = 4;
  const expectedInnerHTMLs = ['1', '2', '...', '9'];
  const undefinedIndex = 4;

  expect(links.length).toEqual(expectedLinkCount);
  
  expectedInnerHTMLs.forEach((expectedHTML, index) => {
    expect(links.get(index).innerHTML).toEqual(expectedHTML);
  });
  
  expect(links.get(undefinedIndex)).toEqual(undefined);
})