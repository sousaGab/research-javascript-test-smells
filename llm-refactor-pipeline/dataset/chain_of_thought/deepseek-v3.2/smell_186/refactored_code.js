test('when help option (without command-argument) then help called', () => {
    const program = makeProgram();
    const mockHelp = jest.fn(() => '');

    program.exitOverride().configureHelp({ formatHelp: mockHelp });
    expect(() => program.parse(['--help'], { from: 'user' })).not.toThrow();
    expect(mockHelp).toHaveBeenCalled();
});