it("produces similar or better compaction height", () => {
  const TOTAL_RUNS = 50;
  const LAYOUT_ITEM_COUNT = 30;
  const GRID_COLUMNS = 12;

  // Fast compactor should not be significantly worse.
  // "At most 80% worse" => standard better in fewer than 80% of runs.
  const MAX_STANDARD_BETTER_RUNS = 40;

  let fastBetterRuns = 0;
  let standardBetterRuns = 0;
  let equalHeightRuns = 0;

  for (let run = 0; run < TOTAL_RUNS; run++) {
    const layout = generateMessyLayout(LAYOUT_ITEM_COUNT, GRID_COLUMNS);

    const standardCompacted = verticalCompactor.compact(layout, GRID_COLUMNS);
    const fastCompacted = fastVerticalCompactor.compact(layout, GRID_COLUMNS);

    const standardHeight = layoutHeight(standardCompacted);
    const fastHeight = layoutHeight(fastCompacted);

    if (fastHeight < standardHeight) fastBetterRuns++;
    else if (standardHeight < fastHeight) standardBetterRuns++;
    else equalHeightRuns++;
  }

  console.log(
    [
      "",
      `  Compaction height comparison (${TOTAL_RUNS} random layouts):`,
      `    Fast better: ${fastBetterRuns}`,
      `    Standard better: ${standardBetterRuns}`,
      `    Equal: ${equalHeightRuns}`
    ].join("\n")
  );

  expect(standardBetterRuns).toBeLessThan(MAX_STANDARD_BETTER_RUNS);
});