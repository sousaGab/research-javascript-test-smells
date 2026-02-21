const nockBackOptions = {
  before(scope) {
    scope.filteringPath = path =>
      path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
  },
}