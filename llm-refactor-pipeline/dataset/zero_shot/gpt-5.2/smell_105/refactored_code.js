it("sets the director for multiple movies when setting path values directly", function() {
    var cache = {};
    var version = 0;

    var model = getModel({ cache: cache, version: version++ });
    var directorName = "Quentin Tarantino";
    var movieIds = ["pulp-fiction", "kill-bill-1", "reservior-dogs"];

    setPathValues(model, [
        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", directorName)
    ]);

    var expectedCache = {
        movies: movieIds.reduce(function(acc, id) {
            acc[id] = { director: $atom(directorName) };
            return acc;
        }, {})
    };

    expect(strip(cache)).toEqual(strip(expectedCache));
});