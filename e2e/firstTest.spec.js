describe('First Test', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have an onboarding continue button', async () => {
    await expect(
      element(by.id('onboarding:introduction:button:continue'))
    ).toExist();
  });
});
