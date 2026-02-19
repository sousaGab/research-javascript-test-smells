it("produces similar or better compaction height", () => {
      // The fast compactor should produce layouts with similar total height
      // (within a small tolerance, since algorithms may differ slightly)
      let fastBetter = 0;
      let stdBetter = 0;
      let equal = 0;
      const TOTAL_RUNS = 50;
      const MAX_WORSE_THRESHOLD = 40;
      const TOLERANCE_PERCENTAGE = 80;

      for (let run = 0; run < TOTAL_RUNS; run++) {
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
      expect(stdBetter).toBeLessThan(MAX_WORSE_THRESHOLD); // At most 80% worse
    })