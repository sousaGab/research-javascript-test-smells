import detectSensitiveEquality from "./sensitiveEquality.js";
import detectAnonymousTest from "./anonymousTest.js";
import detectCommentsOnlyTest from "./commentsOnlyTest.js";
import detectGeneralFixture from "./generalFixture.js";
import detectTestWithoutDescription from "./testWithoutDescription.js";
import detectTranscriptingTest from "./transcriptingTest.js";
import detectOvercommentedTest from "./overcommented.js";
import detectIdenticalTestDescription from "./identicalTestDescription.js";
import detectComplexSnapshot from "./complexSnapshot.js";
import detectConditionalTestLogic from "./conditionalTestLogic.js";
import detectNonFunctionalStatement from "./nonFunctionalStatement.js";
import detectOnlyTest from "./onlyTest.js";
import detectSubOptimalAssert from "./subOptimalAssert.js";
import detectVerboseTest from "./verboseTest.js";
import detectVerifyInSetup from "./verifyInSetup.js";

export const detectors = [
  detectAnonymousTest,
  detectSensitiveEquality,
  detectCommentsOnlyTest,
  detectGeneralFixture,
  detectTestWithoutDescription,
  detectTranscriptingTest,
  detectOvercommentedTest,
  detectIdenticalTestDescription,
  detectComplexSnapshot,
  detectConditionalTestLogic,
  detectNonFunctionalStatement,
  detectOnlyTest,
  detectSubOptimalAssert,
  detectVerboseTest,
  detectVerifyInSetup,
];
