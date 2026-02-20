it('should have default settings', function () {
      const totalPages = 4
      const firstPage = '1'
      const secondPage = '2'
      const ellipsis = '...'
      const lastPage = '9'
      const expectedPageElements = [firstPage, secondPage, ellipsis, lastPage]
      
      expect(pagination.find('a').length).toEqual(totalPages)
      expect(pagination.find('a').get(0).innerHTML).toEqual(firstPage)
      expect(pagination.find('a').get(1).innerHTML).toEqual(secondPage)
      expect(pagination.find('a').get(2).innerHTML).toEqual(ellipsis)
      expect(pagination.find('a').get(3).innerHTML).toEqual(lastPage)
      expect(pagination.find('a').get(4)).toEqual(undefined)
    })