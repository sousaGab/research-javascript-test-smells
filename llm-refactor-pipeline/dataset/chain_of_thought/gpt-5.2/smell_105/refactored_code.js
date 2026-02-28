it("sets the same director for multiple movies via a pathset", function () {
    var cache = {};
    var version = 0;
    var directorName = "Quentin Tarantino";
    var movieIds = ["pulp-fiction", "kill-bill-1", "reservior-dogs"];

    setPathValues(getModel({ cache: cache, version: version++ }), [
        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", directorName)
    ]);

    var expectedCache = {
        movies: movieIds.reduce(function (acc, id) {
            acc[id] = { director: $atom(directorName) };
            return acc;
        }, {})
    };

    expect(strip(cache)).toEqual(strip(expectedCache));
});