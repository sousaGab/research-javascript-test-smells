it('should use custom function in third argument', function () {
      var result = list.search('jonny', ['name'], customSearchFunction)
      expect(result.length).toEqual(4)
    })