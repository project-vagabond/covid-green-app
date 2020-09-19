describe('First Test', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('onboarding:introduction:header')))
      .toExist()
      .withTimeout(5000);
  });

  it('should have an onboarding continue button', async () => {
    await expect(
      element(by.id('onboarding:introduction:button:continue'))
    ).toExist();
  });
});
