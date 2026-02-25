it("should re-emit favicon and assets from a loader if watch is active", async () => {
  const template = path.join(
    __dirname,
    "./fixtures/html-template-with-image.html",
  );
  const config = {
    mode: "development",
    entry: path.join(__dirname, "fixtures/index.js"),
    output: {
      assetModuleFilename: "[name][ext]",
      path: OUTPUT_DIR,
    },
    module: {
      rules: [{
        test: /\.html$/,
        loader: "html-loader"
      }, ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: path.join(__dirname, "./fixtures/favicon.ico"),
        template,
      }),
    ],
  };

  const templateContent = fs.readFileSync(template, "utf-8");
  const compiler = new WebpackRecompilationSimulator(webpack(config));
  const jsFileTempPath = compiler.addTestFile(
    path.join(__dirname, "fixtures/index.js"),
  );
  const expectedAssets = ["logo.png", "main.js", "favicon.ico", "index.html"];

  const assertAssetsAndErrors = (stats) => {
    expect(Object.keys(stats.compilation.assets)).toEqual(
      expect.arrayContaining(expectedAssets),
    );
    expect(stats.compilation.errors).toEqual([]);
    expect(stats.compilation.warnings).toEqual([]);
  };

  try {
    const initialStats = await compiler.startWatching();
    assertAssetsAndErrors(initialStats);

    // Change the js file and compile again
    fs.writeFileSync(
      jsFileTempPath,
      "module.exports = function calc(a, b){ return a - b };",
    );
    const secondStats = await compiler.waitForWatchRunComplete();
    assertAssetsAndErrors(secondStats);

    // Change the template file and compile again
    fs.writeFileSync(
      template,
      templateContent.replace(/Some unique text/, "Some other unique text"),
    );
    const thirdStats = await compiler.waitForWatchRunComplete();
    assertAssetsAndErrors(thirdStats);

    // Restore original template
    fs.writeFileSync(template, templateContent);
  } finally {
    await compiler.stopWatching();
  }
});