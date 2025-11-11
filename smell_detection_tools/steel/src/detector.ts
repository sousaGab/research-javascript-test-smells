import { callPlugins } from './pluginManager';
import { Report } from './types';
import { processData } from './data';
import { NoFileError } from './errors';
import { Either, left, right } from './either';
import { parseSuites } from './files';

export default function run(pattern: string): Either<NoFileError, Report> {
  const suites = parseSuites(pattern);
  if (suites.isLeft()) {
    console.error('No files found or error occurred:', suites.value); // Debug log
    return left(suites.value);
  }
  const detections = suites.value.map(callPlugins);
  // console.log('Get here', detections); // Debug log
  const report = processData(detections);
  console.log('FINISH ALL REPORTS')
  return right(report);
}