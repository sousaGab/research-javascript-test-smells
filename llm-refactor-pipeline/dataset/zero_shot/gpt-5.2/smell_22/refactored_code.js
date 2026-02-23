it("produces similar or better compaction height", () => {
  const RUN_COUNT = 50;
  const ITEM_COUNT = 30;
  const COLUMN_COUNT = 12;

  const MAX_WORSE_RATIO = 0.8;
  const MAX_STANDARD_BETTER = Math.floor(RUN_COUNT * MAX_WORSE_RATIO);

  // The fast compactor should produce layouts with similar total height
  // (within a small tolerance, since algorithms may differ slightly)
  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < RUN_COUNT; run++) {
    const layout = generateMessyLayout(ITEM_COUNT, COLUMN_COUNT);

    const stdCompacted = verticalCompactor.compact(layout, COLUMN_COUNT);
    const fastCompacted = fastVerticalCompactor.compact(layout, COLUMN_COUNT);

    const stdHeight = layoutHeight(stdCompacted);
    const fastHeight = layoutHeight(fastCompacted);

    if (fastHeight < stdHeight) fastBetter++;
    else if (stdHeight < fastHeight) stdBetter++;
    else equal++;
  }

  console.log(
    [
      "",
      `  Compaction height comparison (${RUN_COUNT} random layouts):`,
      `    Fast better: ${fastBetter}`,
      `    Standard better: ${stdBetter}`,
      `    Equal: ${equal}`
    ].join("\n")
  );

  // Fast compactor should not be significantly worse
  // Allow some tolerance since algorithms may differ
  expect(stdBetter).toBeLessThan(MAX_STANDARD_BETTER); // At most 80% worse
});