it('should switch sorting order when clicking multiple times', function (done) {
      let sortRun = 0
      const sortButton = $('#sort-name')[0]

      list.on('sortComplete', function () {
        sortRun++
        if (sortRun === 1) {
          expect($('#sort-name').hasClass('asc')).toBe(true)
          expect($('#sort-name').hasClass('desc')).toBe(false)
          fireClick(sortButton) // Trigger second sort
        } else if (sortRun === 2) {
          expect($('#sort-name').hasClass('asc')).toBe(false)
          expect($('#sort-name').hasClass('desc')).toBe(true)
          fireClick(sortButton) // Trigger third sort
        } else if (sortRun === 3) {
          expect($('#sort-name').hasClass('asc')).toBe(true)
          expect($('#sort-name').hasClass('desc')).toBe(false)
          done()
        }
      })

      // Initial state check
      expect($('#sort-name').hasClass('asc')).toBe(false)
      expect($('#sort-name').hasClass('desc')).toBe(false)

      // Trigger first sort
      fireClick(sortButton)
    })