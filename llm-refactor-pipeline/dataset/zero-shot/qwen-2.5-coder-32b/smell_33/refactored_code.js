it('should have default settings', function () {
      const pageLinks = pagination.find('a')
      const expectedPageCount = 4
      const firstPage = '1'
      const secondPage = '2'
      const ellipsis = '...'
      const lastPage = '9'
      const nonExistentPage = undefined
      
      expect(pageLinks.length).toEqual(expectedPageCount)
      expect(pageLinks.get(0).innerHTML).toEqual(firstPage)
      expect(pageLinks.get(1).innerHTML).toEqual(secondPage)
      expect(pageLinks.get(2).innerHTML).toEqual(ellipsis)
      expect(pageLinks.get(3).innerHTML).toEqual(lastPage)
      expect(pageLinks.get(4)).toEqual(nonExistentPage)
    })