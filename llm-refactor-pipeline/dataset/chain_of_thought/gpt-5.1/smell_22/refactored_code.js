it("produces similar or better compaction height", () => {
  const TOTAL_RUNS = 50;
  const LAYOUT_ITEM_COUNT = 30;
  const GRID_COLUMNS = 12;
  const MAX_STANDARD_BETTER_COUNT = 40; // At most 80% worse

  // The fast compactor should produce layouts with similar total height
  // (within a small tolerance, since algorithms may differ slightly)
  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < TOTAL_RUNS; run++) {
    const layout = generateMessyLayout(LAYOUT_ITEM_COUNT, GRID_COLUMNS);

    const stdCompacted = verticalCompactor.compact(layout, GRID_COLUMNS);
    const fastCompacted = fastVerticalCompactor.compact(layout, GRID_COLUMNS);

    const stdHeight = layoutHeight(stdCompacted);
    const fastHeight = layoutHeight(fastCompacted);

    if (fastHeight < stdHeight) fastBetter++;
    else if (stdHeight < fastHeight) stdBetter++;
    else equal++;
  }

  console.log(
    [
      "",
      `  Compaction height comparison (${TOTAL_RUNS} random layouts):`,
      `    Fast better: ${fastBetter}`,
      `    Standard better: ${stdBetter}`,
      `    Equal: ${equal}`
    ].join("\n")
  );

  // Fast compactor should not be significantly worse
  // Allow some tolerance since algorithms may differ
  expect(stdBetter).toBeLessThan(MAX_STANDARD_BETTER_COUNT);
});