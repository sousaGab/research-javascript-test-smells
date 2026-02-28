const TOTAL_RUNS = 50;
const MAX_WORSE_PERCENTAGE = 0.8;
const MAX_WORSE_RUNS = TOTAL_RUNS * MAX_WORSE_PERCENTAGE;
const LAYOUT_ITEM_COUNT = 30;
const COMPACTION_SPACING = 12;

it("produces similar or better compaction height", () => {
  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < TOTAL_RUNS; run++) {
    const layout = generateMessyLayout(LAYOUT_ITEM_COUNT, COMPACTION_SPACING);

    const stdCompacted = verticalCompactor.compact(layout, COMPACTION_SPACING);
    const fastCompacted = fastVerticalCompactor.compact(layout, COMPACTION_SPACING);

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

  expect(stdBetter).toBeLessThan(MAX_WORSE_RUNS);
});