it("produces similar or better compaction height", () => {
  // The fast compactor should produce layouts with similar total height
  // (within a small tolerance, since algorithms may differ slightly)
  const NUM_RUNS = 50;
  const TOLERANCE = 0.1;
  const fastBetter = 0;
  const stdBetter = 0;
  const equal = 0;

  for (let run = 0; run < NUM_RUNS; run++) {
    const layout = generateMessyLayout(30, 12);

    const stdCompacted = verticalCompactor.compact(layout, 12);
    const fastCompacted = fastVerticalCompactor.compact(layout, 12);

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
  expect(stdBetter).toBeLessThan(NUM_RUNS * TOLERANCE); // At most 10% worse
})