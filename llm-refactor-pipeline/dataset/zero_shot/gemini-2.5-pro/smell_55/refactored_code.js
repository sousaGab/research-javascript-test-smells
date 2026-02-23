it("handles items at x position beyond grid", () => {
      const layout = [
        { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
      ];
      const expectedLayout = [
        { i: "a", x: 10, y: 0, w: 2, h: 2 } // 'x' is clamped to fit
      ];

      const compacted = fastVerticalCompactor.compact(layout, 12);
      expect(compacted).toEqual(expectedLayout);
    })