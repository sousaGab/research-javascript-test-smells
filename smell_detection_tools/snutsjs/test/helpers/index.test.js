import { describe, expect, it, vi } from "vitest";
import helpers from "../../src/common/helpers";
import fs from "node:fs";

describe("Helpers", () => {
  it("should check is a valid github repository url", () => {
    const isValid = helpers.isValidRepositoryUrl(
      "https://github.com/johndoe/somerepo"
    );
    expect(isValid).toBe(true);
  });
  it("should check is a valid gitlab repository url", () => {
    const isValid = helpers.isValidRepositoryUrl(
      "https://gitlab.com/johndoe/somerepo"
    );
    expect(isValid).toBe(true);
  });

  it("should get github repository info", () => {
    const data = helpers.getRepositoryInfo(
      "https://github.com/johndoe/somerepo"
    );

    const { platform, userName, projectName } = data;
    expect(platform).toEqual("github");
    expect(userName).toEqual("johndoe");
    expect(projectName).toEqual("somerepo");
  });
  it("should get gitlab repository info", () => {
    const data = helpers.getRepositoryInfo(
      "https://gitlab.com/johndoe/somerepo"
    );

    const { platform, userName, projectName } = data;
    expect(platform).toEqual("gitlab");
    expect(userName).toEqual("johndoe");
    expect(projectName).toEqual("somerepo");
  });

  it("should check if directory exists", async () => {
    const path = "somepath/";
    const mock = vi.spyOn(fs, "existsSync");
    mock.mockResolvedValue(true);
    const result = await helpers.checkIfFolderExist(path);
    expect(result).toBeTruthy();
  });

  it("should check if directory not exists", async () => {
    const path = "somepath/";
    const mock = vi.spyOn(fs, "existsSync");
    mock.mockResolvedValue(false);
    const result = await helpers.checkIfFolderExist(path);
    expect(result).toBeFalsy();
  });

  it("should resolve when git clone is successful ", async () => {
    const mock = await vi.spyOn(helpers, "downloadRepository");
    mock.mockResolvedValue();
    expect(mock).toBeDefined();
  });

  it("should get path after public folder", () => {
    const afterPath = "folder/project";
    const fullPath = "/public/" + afterPath;
    const result = helpers.getPathAfterPublic(fullPath);
    expect(result).toEqual(afterPath);
  });

  it("should return null when pass a invalid path", () => {
    const fullPath = "invalid path";
    const result = helpers.getPathAfterPublic(fullPath);
    expect(result).toEqual(null);
  });
});
