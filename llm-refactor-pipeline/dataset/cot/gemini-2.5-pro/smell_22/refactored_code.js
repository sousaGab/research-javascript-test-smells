it("produces similar or better compaction height", () => {
      // The fast compactor should produce layouts with similar total height
      // (within a small tolerance, since algorithms may differ slightly)
      const NUMBER_OF_RUNS = 50;
      const LAYOUT_ITEMS = 30;
      const LAYOUT_COLUMNS = 12;
      const WORST_CASE_TOLERANCE_PERCENTAGE = 0.8; // 80%
      const MAX_ALLOWED_WORSE_CASES = NUMBER_OF_RUNS * WORST_CASE_TOLERANCE_PERCENTAGE;

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

      // Fast compactor should not be significantly worse.
      // `stdBetter` counts cases where the fast compactor was worse.
      // This count should not exceed the allowed tolerance.
      expect(stdBetter).toBeLessThan(MAX_ALLOWED_WORSE_CASES);
    })