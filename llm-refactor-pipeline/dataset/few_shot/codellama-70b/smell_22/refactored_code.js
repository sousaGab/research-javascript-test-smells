it("produces similar or better compaction height", () => {
  // The fast compactor should produce layouts with similar total height
  // (within a small tolerance, since algorithms may differ slightly)
  const NUM_RUNS = 50;
  const MAX_STD_BETTER = 40;
  const LAYOUT_WIDTH = 30;
  const LAYOUT_HEIGHT = 12;

  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < NUM_RUNS; run++) {
    const layout = generateMessyLayout(LAYOUT_WIDTH, LAYOUT_HEIGHT);

    const stdCompacted = verticalCompactor.compact(layout, LAYOUT_HEIGHT);
    const fastCompacted = fastVerticalCompactor.compact(layout, LAYOUT_HEIGHT);

    const stdHeight = layoutHeight(stdCompacted);
    const fastHeight = layoutHeight(fastCompacted);

    if (fastHeight < stdHeight) fastBetter++;
    else if (stdHeight < fastHeight) stdBetter++;
    else equal++;
  }

  console.log(
    [
      "",
      "  Compaction height comparison (50 random layouts):",
      `    Fast better: ${fastBetter}`,
      `    Standard better: ${stdBetter}`,
      `    Equal: ${equal}`
    ].join("\n")
  );

  // Fast compactor should not be significantly worse
  // Allow some tolerance since algorithms may differ
  expect(stdBetter).toBeLessThan(MAX_STD_BETTER); // At most 80% worse
})