import { serverlessExpressLogger } from '../src/index';
import { expect } from 'chai';

describe('custom levels', () => {
  const logger = serverlessExpressLogger({ level: 'error' });

  const testData = [
    { level: 'error', message: 'error' },
    { level: 'warn', message: 'warn' },
    { level: 'info', message: 'info' },
    { level: 'verbose', message: 'verbose' },
    { level: 'debug', message: 'debug' },
  ];

  testData.forEach((data) => {
    it(`should log ${data.level} messages`, () => {
      const logger = serverlessExpressLogger({ level: data.level });
      logger[data.level](data.message);
      expect(global.console[data.level]).toHaveBeenLastCalledWith({
        message: data.message,
      });
    });
  });
});