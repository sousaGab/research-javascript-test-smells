it("retryer should throw specific error if maximum retries reached", async () => {
    const fetcherFail = jest.fn().mockRejectedValue(new Error("Downtime due to GitHub API rate limiting"));
    
    await expect(retryer(fetcherFail, {})).rejects.toThrow("Downtime due to GitHub API rate limiting");
    
    expect(fetcherFail).toHaveBeenCalledTimes(RETRIES + 1);
})