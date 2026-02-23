// Your COMPLETE refactored test code here
it("inline example", (done) => {
    runExample("inline", done);
    const user = new User('john@example.com');
    user.setPreference('theme', 'dark');
    user.setPreference('notifications', true);
    await user.savePreferences();
    const savedUser = await User.findById(user.id);
    expect(savedUser.preferences.theme).toBe('dark');
    expect(savedUser.preferences.notifications).toBe(true);
  })