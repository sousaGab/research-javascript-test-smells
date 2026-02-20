it('should use custom function in third argument', function () {
      var expectedResultLength = 4
      var result = list.search('jonny', ['name'], customSearchFunction)
      expect(result.length).toEqual(expectedResultLength)
    })