expect(event).not.toBeInstanceOf(BvModalEvent)
expect(event).not.toBeInstanceOf(BvEvent)
expect(event).toBe(null)
expect(failed).toBe(true)