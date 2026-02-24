it('that Logger class is exported', () => {
    const requiredLogger = require('../../lib/winston/logger');
    expect(Logger).toBeDefined();
    expect(requiredLogger).toBeDefined();
    expect(Logger).toBe(requiredLogger);
})