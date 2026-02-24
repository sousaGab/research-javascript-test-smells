it("should re-emit favicon and assets from a loader if watch is active", () => {
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

    const assertAssetsAndCompilerResult = (stats, expectedAssets) => {
      const assetNames = Object.keys(stats.compilation.assets).sort();
      expect(assetNames).toEqual(expectedAssets.sort());
      expect(stats.compilation.errors).toEqual([]);
      expect(stats.compilation.warnings).toEqual([]);
    };

    const templateContent = fs.readFileSync(template, "utf-8");
    const compiler = new WebpackRecompilationSimulator(webpack(config));
    const jsFileTempPath = compiler.addTestFile(
      path.join(__dirname, "fixtures/index.js"),
    );
    const expected = ["favicon.ico", "index.html", "logo.png", "main.js"];

    return (
      compiler
        .startWatching()
        .then((stats) => {
          assertAssetsAndCompilerResult(stats, expected);

          fs.writeFileSync(
            jsFileTempPath,
            "module.exports = function calc(a, b){ return a - b };",
          );

          return compiler.waitForWatchRunComplete();
        })
        .then((stats) => {
          assertAssetsAndCompilerResult(stats, expected);

          fs.writeFileSync(
            template,
            templateContent.replace(
              /Some unique text/,
              "Some other unique text",
            ),
          );

          return compiler.waitForWatchRunComplete();
        })
        .then((stats) => {
          assertAssetsAndCompilerResult(stats, expected);

          fs.writeFileSync(template, templateContent);
        })
        .then(() => compiler.stopWatching())
    );
  })