it("retryer should throw specific error if maximum retries reached", async () => {
    const promise = retryer(fetcherFail, {});
    await expect(promise).rejects.toThrow("Downtime due to GitHub API rate limiting");
    expect(fetcherFail).toHaveBeenCalledTimes(RETRIES + 1);
});