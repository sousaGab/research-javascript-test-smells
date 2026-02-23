// Your COMPLETE refactored test code here

it("directly", function() {
    const cache = {};
    const version = 0;
    const model = getModel({ cache, version: version++ });
    const pathValues = [$pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")];
    setPathValues(model, pathValues);
    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": { "director": $atom("Quentin Tarantino") },
            "kill-bill-1": { "director": $atom("Quentin Tarantino") },
            "reservior-dogs": { "director": $atom("Quentin Tarantino") }
        }
    }));
});