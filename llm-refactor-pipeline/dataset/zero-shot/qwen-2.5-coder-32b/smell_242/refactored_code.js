it("compares with static items (200 items, 20 static)", () => {
      const layout = generateRandomLayout(200, 12, 20);

      const stdTime = measureTime(
        () => verticalCompactor.compact(layout, 12),
        5
      );

      const fastTime = measureTime(
        () => fastVerticalCompactor.compact(layout, 12),
        5
      );

      expect(stdTime).toBeGreaterThan(0);
      expect(fastTime).toBeGreaterThan(0);
      expect(fastTime).toBeLessThan(stdTime);

      console.log(
        [
          "",
          "  With static items (200 items, 20 static):",
          `    Standard: ${stdTime.toFixed(2)}ms`,
          `    Fast:     ${fastTime.toFixed(2)}ms`,
          `    Speedup:  ${(stdTime / fastTime).toFixed(2)}x`
        ].join("\n")
      );
    })