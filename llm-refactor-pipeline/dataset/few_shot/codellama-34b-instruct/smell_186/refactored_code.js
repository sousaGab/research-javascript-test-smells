// Your COMPLETE refactored test code here

test('when help option (without command-argument) then help called', () => {
    const program = makeProgram();
    const mockHelp = jest.fn(() => '');

    program.exitOverride().configureHelp({ formatHelp: mockHelp });
    program.parse(['--help'], { from: 'user' });

    expect(mockHelp).toHaveBeenCalled();
})