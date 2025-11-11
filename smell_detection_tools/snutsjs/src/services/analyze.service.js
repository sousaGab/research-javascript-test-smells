import helpers from "../common/helpers/index.js";
import path from "node:path";
import { detectors } from "../common/detectors/index.js";
import astService from "./ast.service.js";

class AnalyzeService {
  async handleAnalyze(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
      await helpers.downloadRepository(repoUrl, repoFolder);
      const testFiles = await helpers.findTestFiles(directory);
      const astFiles = testFiles.map((tf) => {
        const testAst = astService.parseFileToAst(tf);
        const testInfo = astService.getTestInfo(testAst);
        return detectors.map((detector) => {
          return {
            file: helpers.getPathAfterPublic(tf),
            type: detector.name.replace("detect", ""),
            smells: detector(testAst),
            info: testInfo,
          };
        });
      });
      await helpers.deleteDownloadRepositories(directory);
      return astFiles.flat();
    } catch (error) {
      await helpers.deleteDownloadRepositories(directory);
      console.error("Error when we tried to handle analyze", error);
      throw error;
    }
  }

  async handleAnalyzeLocal(dirname) {
    const directory = path.resolve(path.dirname(""), dirname);
    try {
        const testFiles = await helpers.findTestFiles(directory);
        const astFiles = testFiles.map((tf) => {
            const testAst = astService.parseFileToAst(tf);
            const testInfo = astService.getTestInfo(testAst);
            return detectors.map((detector) => {
                const relativeFilePath = path.relative(directory, tf);
                return {
                    file: relativeFilePath,
                    type: detector.name.replace("detect", ""),
                    smells: detector(testAst),
                    itCount: testInfo.itCount,
                    describeCount: testInfo.describeCount,
                };
            });
        });

        // Flatten the array
        const flatAstFiles = astFiles.flat();

        // Remove duplicates by creating a unique key for each row
        const uniqueAstFiles = Array.from(
            new Set(flatAstFiles.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));

        return uniqueAstFiles;
    } catch (error) {
        console.error("Error when we tried to handle analyze local", error);
        throw error;
    }
  } 

  async handleAnalyzeToCSV(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
        await helpers.downloadRepository(repoUrl, repoFolder);
        const testFiles = await helpers.findTestFiles(directory);
        const astFiles = testFiles.map((tf) => {
            const testAst = astService.parseFileToAst(tf);
            const testInfo = astService.getTestInfo(testAst);
            return detectors.map((detector) => {
                return {
                    file: helpers.getPathAfterPublic(tf),
                    type: detector.name.replace("detect", ""),
                    smells: detector(testAst),
                    itCount: testInfo.itCount,
                    describeCount: testInfo.describeCount,
                };
            });
        });

        // Flatten the array
        const flatAstFiles = astFiles.flat();

        // Remove duplicates by creating a unique key for each row
        const uniqueAstFiles = Array.from(
            new Set(flatAstFiles.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));

        await helpers.deleteDownloadRepositories(directory);
        return uniqueAstFiles;
    } catch (error) {
        await helpers.deleteDownloadRepositories(directory);
        console.error("Error when we tried to handle analyze to csv", error);
        throw error;
    }
  }

  async countTestFiles(repoUrl) {
    const __dirname = path.dirname("");
    const directory = path.resolve(__dirname, "./public");
    const repoFolder = helpers.getRepositoryFolder(repoUrl);
    try {
      await helpers.downloadRepository(repoUrl, repoFolder);
      const testFiles = await helpers.findTestFiles(directory);
      await helpers.deleteDownloadRepositories(directory);
      return testFiles.length;
    } catch (error) {
      await helpers.deleteDownloadRepositories(directory);
      console.error("Error when we tried to count test files", error);
      throw error;
    }
  }

  async splitFilteredResults(filteredResult) {
    let result = [];
  
    filteredResult.forEach(item => {
      item.smells.forEach(smell => {
        result.push({
          file: item.file,
          type: item.type,
          smells: [smell],
          itCount: item.itCount,
          describeCount: item.describeCount
        });
      });
    });
  
    return result;
  }
}

const analyzeService = new AnalyzeService();
export default analyzeService;
