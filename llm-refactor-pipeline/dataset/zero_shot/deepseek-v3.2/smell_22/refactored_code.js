it("produces similar or better compaction height", () => {
  const NUMBER_OF_RUNS = 50;
  const NUMBER_OF_ITEMS = 30;
  const NUMBER_OF_COLUMNS = 12;
  const MAX_ALLOWED_STANDARD_BETTER = 40;
  
  let fastBetter = 0;
  let stdBetter = 0;
  let equal = 0;

  for (let run = 0; run < NUMBER_OF_RUNS; run++) {
    const layout = generateMessyLayout(NUMBER_OF_ITEMS, NUMBER_OF_COLUMNS);

    const stdCompacted = verticalCompactor.compact(layout, NUMBER_OF_COLUMNS);
    const fastCompacted = fastVerticalCompactor.compact(layout, NUMBER_OF_COLUMNS);

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

  expect(stdBetter).toBeLessThan(MAX_ALLOWED_STANDARD_BETTER);
})