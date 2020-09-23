describe('Age Confirmation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('onboarding:age-check:description')))
      .toExist()
      .withTimeout(300000);
  });

  it('should have an age confirm button', async () => {
    await expect(
      element(by.id('onboarding:age-check:button:confirm'))
    ).toExist();
    await element(by.id('onboarding:age-check:button:confirm')).tap();
  });
});
