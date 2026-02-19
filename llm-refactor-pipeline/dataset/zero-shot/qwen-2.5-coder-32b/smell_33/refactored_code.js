it('should have default settings', function () {
      const links = pagination.find('a')
      const expectedLinks = ['1', '2', '...', '9']
      
      expect(links.length).toEqual(expectedLinks.length)
      expect(links.get(0).innerHTML).toEqual(expectedLinks[0])
      expect(links.get(1).innerHTML).toEqual(expectedLinks[1])
      expect(links.get(2).innerHTML).toEqual(expectedLinks[2])
      expect(links.get(3).innerHTML).toEqual(expectedLinks[3])
      expect(links.get(4)).toEqual(undefined)
    })