it("should re-emit favicon and assets from a loader if watch is active", () => {
  const template = path.join(__dirname, "./fixtures/html-template-with-image.html");
  const config = {
    mode: "development",
    entry: path.join(__dirname, "fixtures/index.js"),
    output: {
      assetModuleFilename: "[name][ext]",
      path: OUTPUT_DIR,
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: "html-loader",
        },
      ],
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
  const jsFileTempPath = compiler.addTestFile(path.join(__dirname, "fixtures/index.js"));
  const expected = ["logo.png", "main.js", "favicon.ico", "index.html"];

  const assertCompilation = (stats) => {
    expect(
      expected.every((val) => Object.keys(stats.compilation.assets).includes(val)),
    ).toBe(true);
    expect(stats.compilation.errors).toEqual([]);
    expect(stats.compilation.warnings).toEqual([]);
  };

  return compiler
    .startWatching()
    .then((stats) => {
      assertCompilation(stats);

      fs.writeFileSync(
        jsFileTempPath,
        "module.exports = function calc(a, b){ return a - b };",
      );

      return compiler.waitForWatchRunComplete();
    })
    .then((stats) => {
      assertCompilation(stats);

      fs.writeFileSync(
        template,
        templateContent.replace(/Some unique text/, "Some other unique text"),
      );

      return compiler.waitForWatchRunComplete();
    })
    .then((stats) => {
      assertCompilation(stats);

      fs.writeFileSync(template, templateContent);
    })
    .then(() => compiler.stopWatching());
});