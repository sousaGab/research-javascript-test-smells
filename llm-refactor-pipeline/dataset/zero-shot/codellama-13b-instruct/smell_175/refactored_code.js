it("retryer should throw specific error if maximum retries reached", async () => {
    await expect(retryer(fetcherFail, {})).rejects.toThrowError("Downtime due to GitHub API rate limiting");
    expect(fetcherFail).toHaveBeenCalledTimes(RETRIES + 1);
  })