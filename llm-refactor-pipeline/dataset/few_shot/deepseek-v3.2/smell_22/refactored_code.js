it("produces similar or better compaction height", () => {
  const TOTAL_RUNS = 50;
  const MAX_WORSE_PERCENTAGE = 0.8;
  const MAX_WORSE_COUNT = TOTAL_RUNS * MAX_WORSE_PERCENTAGE;
  const ITEMS_COUNT = 30;
  const CONTAINER_WIDTH = 12;

  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < TOTAL_RUNS; run++) {
    const layout = generateMessyLayout(ITEMS_COUNT, CONTAINER_WIDTH);

    const stdCompacted = verticalCompactor.compact(layout, CONTAINER_WIDTH);
    const fastCompacted = fastVerticalCompactor.compact(layout, CONTAINER_WIDTH);

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

  expect(stdBetter).toBeLessThan(MAX_WORSE_COUNT);
});