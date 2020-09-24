describe('Onboarding Intro', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('onboarding:age-check:description')))
      .toExist()
      .withTimeout(300000);

    await element(by.id('onboarding:age-check:button:confirm')).tap();

    await expect(element(by.id('onboarding:intro:container'))).toExist();
  });

  it('should show the intro title', async () => {
    const title = element(by.id('onboarding:intro:title'));
    await expect(title).toExist();
    await expect(title).toHaveText(
      'Help Stop the Spread of COVID-19 in Your Community'
    );
  });

  it('should show first information list item', async () => {
    const info = element(by.id('onboarding:intro:info-0'));
    await expect(info).toExist();
    await expect(info).toHaveText(
      'Get alerted if you recently spent more than 10 minutes within 6 feet of someone who tests positive.'
    );
  });

  it('should show second information list item', async () => {
    const info = element(by.id('onboarding:intro:info-1'));
    await expect(info).toExist();
    await expect(info).toHaveText('Alert others if you test positive.');
  });

  it('should show third information list item', async () => {
    const info = element(by.id('onboarding:intro:info-2'));
    await expect(info).toExist();
    await expect(info).toHaveText('Keep an eye on trends in your community.');
  });

  it('should have learn how it works button', async () => {
    await expect(element(by.id('onboarding:intro:learnAction'))).toExist();
  });

  it('should have continue to permissions button', async () => {
    await expect(element(by.id('onboarding:intro:button:continue'))).toExist();
  });
});
