test('when help option (without command-argument) then help called', () => {
    const program = makeProgram();
    const mockHelp = jest.fn(() => '');

    program.exitOverride().configureHelp({ formatHelp: mockHelp });
    expect(() => program.parse(['--help'], { from: 'user' })).toThrow();
    expect(mockHelp).toHaveBeenCalled();
})