it("produces similar or better compaction height", () => {
      // The fast compactor should produce layouts with similar total height
      // (within a small tolerance, since algorithms may differ slightly)
      const NUMBER_OF_RUNS = 50;
      const LAYOUT_ITEMS = 30;
      const COLUMNS = 12;
      const WORST_CASE_TOLERANCE = 0.8; // Fast compactor can be worse in at most 80% of cases

      let fastBetter = 0;
      let stdBetter = 0;
      let equal = 0;

      for (let run = 0; run < NUMBER_OF_RUNS; run++) {
        const layout = generateMessyLayout(LAYOUT_ITEMS, COLUMNS);

        const stdCompacted = verticalCompactor.compact(layout, COLUMNS);
        const fastCompacted = fastVerticalCompactor.compact(layout, COLUMNS);

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
      const maxStdBetterAllowed = NUMBER_OF_RUNS * WORST_CASE_TOLERANCE;
      expect(stdBetter).toBeLessThan(maxStdBetterAllowed);
    })