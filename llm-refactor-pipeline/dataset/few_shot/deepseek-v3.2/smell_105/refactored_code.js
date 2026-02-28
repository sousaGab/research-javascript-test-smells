it("directly", function() {
    var cache = {};
    var version = 0;
    var model = getModel({ cache: cache, version: version++ });
    
    setPathValues(model, [
        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")
    ]);

    var expected = {
        movies: {
            "pulp-fiction": { "director": $atom("Quentin Tarantino") },
            "kill-bill-1": { "director": $atom("Quentin Tarantino") },
            "reservior-dogs": { "director": $atom("Quentin Tarantino") }
        }
    };

    expect(strip(cache)).toEqual(strip(expected));
})