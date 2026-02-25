it("compares with static items (200 items, 20 static)", () => {
      const layout = generateRandomLayout(200, 12, 20);
      let stdResult, fastResult;

      const stdTime = measureTime(
        () => {
          stdResult = verticalCompactor.compact(layout, 12);
        },
        5
      );

      const fastTime = measureTime(
        () => {
          fastResult = fastVerticalCompactor.compact(layout, 12);
        },
        5
      );

      console.log(
        [
          "",
          "  With static items (200 items, 20 static):",
          `    Standard: ${stdTime.toFixed(2)}ms`,
          `    Fast:     ${fastTime.toFixed(2)}ms`,
          `    Speedup:  ${(stdTime / fastTime).toFixed(2)}x`
        ].join("\n")
      );

      // Assert that both compactors produce the same, correct layout
      expect(fastResult).toEqual(stdResult);
      // Assert that the fast compactor is actually faster
      expect(fastTime).toBeLessThan(stdTime);
    })