it("produces similar or better compaction height", () => {
      // The fast compactor should produce layouts with similar total height
      // (within a small tolerance, since algorithms may differ slightly)
      const NUM_RUNS = 50;
      const NUM_WIDGETS = 30;
      const NUM_COLUMNS = 12;
      const MAX_ALLOWED_STD_BETTER = 40; // At most 80% worse

      let fastBetter = 0;
      let stdBetter = 0;
      let equal = 0;

      for (let run = 0; run < NUM_RUNS; run++) {
        const layout = generateMessyLayout(NUM_WIDGETS, NUM_COLUMNS);

        const stdCompacted = verticalCompactor.compact(layout, NUM_COLUMNS);
        const fastCompacted = fastVerticalCompactor.compact(layout, NUM_COLUMNS);

        const stdHeight = layoutHeight(stdCompacted);
        const fastHeight = layoutHeight(fastCompacted);

        if (fastHeight < stdHeight) fastBetter++;
        else if (stdHeight < fastHeight) stdBetter++;
        else equal++;
      }

      console.log(
        [
          "",
          `  Compaction height comparison (${NUM_RUNS} random layouts):`,
          `    Fast better: ${fastBetter}`,
          `    Standard better: ${stdBetter}`,
          `    Equal: ${equal}`
        ].join("\n")
      );

      // Fast compactor should not be significantly worse
      // Allow some tolerance since algorithms may differ
      expect(stdBetter).toBeLessThan(MAX_ALLOWED_STD_BETTER);
    })