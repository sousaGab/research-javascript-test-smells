it("sets the same director for multiple movies directly", function setDirectorForMultipleMoviesDirectly() {
    var cache = {};
    var version = 0;

    var model = getModel({ cache: cache, version: version++ });
    var pathValues = [
        $pathValue(
            "movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director",
            "Quentin Tarantino"
        )
    ];

    setPathValues(model, pathValues);

    var expectedCache = {
        movies: {
            "pulp-fiction": { director: $atom("Quentin Tarantino") },
            "kill-bill-1": { director: $atom("Quentin Tarantino") },
            "reservior-dogs": { director: $atom("Quentin Tarantino") }
        }
    };

    expect(strip(cache)).toEqual(strip(expectedCache));
});