function setup() {
    var cache = {};
    var version = 0;
    return {
        cache: cache,
        version: version++
    };
}

it("directly", function() {
    var model = getModel(setup());
    setPathValues(model, [
        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")
    ]);

    expect(strip(model.cache)).toEqual(strip({
        movies: {
            "pulp-fiction": { "director": $atom("Quentin Tarantino") },
            "kill-bill-1": { "director": $atom("Quentin Tarantino") },
            "reservior-dogs": { "director": $atom("Quentin Tarantino") }
        }
    }));
});