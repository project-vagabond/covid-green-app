describe('Age Confirmation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('onboarding:age-check:description')))
      .toExist()
      .withTimeout(300000);
  });

  it('should have the header logo', async () => {
    await expect(element(by.id('onboarding:age-check:header-logo'))).toExist();
  });

  it('should have the footer logo', async () => {
    await expect(element(by.id('onboarding:age-check:footer-logo'))).toExist();
  });

  it('should have age confirm description text', async () => {
    const description = element(by.id('onboarding:age-check:description'));
    await expect(description).toExist();
    await expect(description).toHaveText(
      'I am over 18, or I am the parent or guardian of a minor confirming that they can use the app.'
    );
  });

  it('should have an age confirm button', async () => {
    const button = element(by.id('onboarding:age-check:button:confirm'));
    await expect(button).toExist();
  });

  it('should navigate you to the onboarding screen when tapping confirm', async () => {
    await element(by.id('onboarding:age-check:button:confirm')).tap();

    await expect(element(by.id('onboarding:intro:container'))).toExist();
  });
});
