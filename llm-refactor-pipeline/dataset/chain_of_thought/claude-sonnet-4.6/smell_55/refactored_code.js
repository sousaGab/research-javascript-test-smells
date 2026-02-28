it("handles items at x position beyond grid", () => {
      const layout = [
        { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
      ];

      // Should not throw
      const compacted = fastVerticalCompactor.compact(layout, 12);
      expect(compacted).toHaveLength(1);
      expect(compacted[0].i).toBe("a");
    })