import { glob } from "glob";
import { exec } from "node:child_process";
import fs from "node:fs";
import { rimraf } from "rimraf";
import path from "node:path";
import parser from "@babel/parser";
import process from "node:process";

const IS_WIN_SO = process.platform === "win32";

// const TEST_FILE_PATTERNS = [
//   "**/*.test.js",
//   "**/*.spec.js",
//   "**/*test*.js",
//   "**/*spec*.js",
//   "**/__tests__/**/*.js",
//   "**/__specs__/**/*.js",
//   "**/test/**/*.js",
//   "**/tests/**/*.js",
//   "**/spec/**/*.js",
//   "**/specs/**/*.js"
// ];

const TEST_FILE_PATTERNS = [
  "**/*.test.js",
  "**/*.tests.js",
  "**/*.spec.js",
  "**/*.specs.js",
  "**/*test_*.js",
  "**/*test-*.js",
  "**/*Test*.js",
  "**/*Spec*.js",
  "**/__tests__/**/*.js",
  "**/__specs__/**/*.js",
  "**/test/**/*.js",
  "**/tests/**/*.js",
  "**/spec/**/*.js",
  "**/specs/**/*.js",
  "**/test/**/*test*.js",
  "**/test/**/*spec*.js", 
  "**/tests/**/*test*.js",
  "**/tests/**/*spec*.js",
];

class Helpers {
  checkIfFolderExist(path) {
    return fs.existsSync(path);
  }
  getPathAfterPublic(filePath) {
    const regex = /[\\/]+public[\\/]+(.+)/;
    const match = filePath.match(regex);
    return match ? match[1] : null;
  }
  isValidRepositoryUrl(url) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(github|gitlab)\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)(?:\/.*)?/;
    return regex.test(url);
  }
  isValidDirectory(dirname) {
    const regex = /^[a-zA-Z0-9._\-\/]+$/;
    return regex.test(dirname);
  }
  getRepositoryInfo(url) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(github|gitlab)\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)(?:\/.*)?/;
    const match = url.match(regex);

    if (match) {
      // eslint-disable-next-line
      const [_, platform, userName, projectName] = match;
      return { platform, userName, projectName };
    }

    return null;
  }
  getRepositoryFolder(repoUrl) {
    const __dirname = path.dirname("");
    const { userName, projectName } = this.getRepositoryInfo(repoUrl);
    const folder = `${userName}/${projectName}`;
    const dir = path.resolve(__dirname, "public", folder);
    return dir;
  }
  async deleteDownloadRepositories(directory) {
    const exist = this.checkIfFolderExist(directory);
    if (!exist) return;
    return await rimraf(directory);
  }

  downloadRepository(repoUrl, directory) {
    return new Promise((resolve, reject) => {
      exec(`git clone ${repoUrl} ${directory}`, (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });
  }

  async findTestFiles(directory) {
    const options = {
      ignore: ["**/node_modules/**", "**/contrib/**"],
      cwd: directory,
      windowsPathsNoEscape: IS_WIN_SO,
      absolute: true,
      nodir: true,
    };

    const testFiles = await Promise.all(
      TEST_FILE_PATTERNS.map((pattern) => glob(pattern, options))
    );

    return testFiles.flat();
  }

  parseFile(file) {
    const code = fs.readFileSync(file, "utf8");
    return parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  }
}

const helpers = new Helpers();

export default helpers;
