it('should have default settings', function () {
      const links = pagination.find('a')
      const expectedLinks = [
        { index: 0, text: '1' },
        { index: 1, text: '2' },
        { index: 2, text: '...' },
        { index: 3, text: '9' }
      ]
      
      expect(links.length).toEqual(expectedLinks.length)
      
      expectedLinks.forEach(({ index, text }) => {
        expect(links.get(index).innerHTML).toEqual(text)
      })
      
      expect(links.get(4)).toEqual(undefined)
    })