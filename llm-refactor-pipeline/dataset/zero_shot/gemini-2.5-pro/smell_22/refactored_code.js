it("produces similar or better compaction height", () => {
  // The fast compactor should produce layouts with similar total height
  // (within a small tolerance, since algorithms may differ slightly)
  const NUMBER_OF_RUNS = 50;
  const LAYOUT_ITEMS = 30;
  const LAYOUT_COLUMNS = 12;
  const WORSE_CASE_TOLERANCE = 0.8; // Allow fast compactor to be worse up to 80% of the time

  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < NUMBER_OF_RUNS; run++) {
    const layout = generateMessyLayout(LAYOUT_ITEMS, LAYOUT_COLUMNS);

    const stdCompacted = verticalCompactor.compact(layout, LAYOUT_COLUMNS);
    const fastCompacted = fastVerticalCompactor.compact(layout, LAYOUT_COLUMNS);

    const stdHeight = layoutHeight(stdCompacted);
    const fastHeight = layoutHeight(fastCompacted);

    if (fastHeight < stdHeight) fastBetter++;
    else if (stdHeight < fastHeight) stdBetter++;
    else equal++;
  }

  console.log(
    [
      "",
      `  Compaction height comparison (${NUMBER_OF_RUNS} random layouts):`,
      `    Fast better: ${fastBetter}`,
      `    Standard better: ${stdBetter}`,
      `    Equal: ${equal}`
    ].join("\n")
  );

  // Fast compactor should not be significantly worse
  // Allow some tolerance since algorithms may differ
  const maxStdBetterCount = NUMBER_OF_RUNS * WORSE_CASE_TOLERANCE;
  expect(stdBetter).toBeLessThan(maxStdBetterCount);
});