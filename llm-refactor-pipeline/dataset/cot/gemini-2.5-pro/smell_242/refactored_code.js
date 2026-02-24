it("compares with static items (200 items, 20 static)", () => {
      const layout = generateRandomLayout(200, 12, 20);

      // First, ensure correctness by comparing the output of both compactors.
      const standardResult = verticalCompactor.compact(layout, 12);
      const fastResult = fastVerticalCompactor.compact(layout, 12);
      expect(fastResult).toEqual(standardResult);

      // Then, assert the performance improvement.
      const stdTime = measureTime(
        () => verticalCompactor.compact(layout, 12),
        5
      );

      const fastTime = measureTime(
        () => fastVerticalCompactor.compact(layout, 12),
        5
      );

      expect(fastTime).toBeLessThan(stdTime);
    });