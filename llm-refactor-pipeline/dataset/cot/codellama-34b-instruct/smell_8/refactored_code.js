expect(
  expected.every((val) =>
    Object.keys(stats.compilation.assets).includes(val),
  ),
).toBe(true);
expect(stats.compilation.errors).toEqual([]);
expect(stats.compilation.warnings).toEqual([]);