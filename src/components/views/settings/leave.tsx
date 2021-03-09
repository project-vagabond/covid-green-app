import React, {FC} from 'react';
import {Alert, View, Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {NavigationProp} from '@react-navigation/native';
import {useExposure} from 'react-native-exposure-notification-service';
import PushNotification from 'react-native-push-notification';

import {forget, networkError} from 'services/api';
import {getDeviceLanguage} from 'services/i18n';
import {useApplication} from 'providers/context';
import {ScreenNames} from 'navigation';

import {Button} from 'components/atoms/button';
import {Markdown} from 'components/atoms/markdown';
import {Spacing} from 'components/atoms/spacing';
import {PinnedBottom} from 'components/templates/pinned';
import {DataProtectionLink} from 'components/views/data-protection-policy';

export const Leave: FC<{navigation: NavigationProp<any>}> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const app = useApplication();
  const exposure = useExposure();
  const confirmed = async () => {
    app.showActivityIndicator();
    try {
      try {
        await exposure.deleteAllData();
        await exposure.stop();
      } catch (err) {
        console.log(err);
      }
      PushNotification.setApplicationIconBadgeNumber(0);
      const deviceLanguage = getDeviceLanguage();
      const willRestart = i18n.dir(i18n.language) !== i18n.dir(deviceLanguage);

      await forget();
      await app.clearContext();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === 'ios' && willRestart) {
        // Published builds (not local) in this scenario get spinner stuck on forever
        // Wait until spinner is fully hidden before allowing app to restart
        app.hideActivityIndicator();
        setTimeout(() => i18n.changeLanguage(deviceLanguage), 800);
        return;
      }

      // If language reset changes RTL/LTR, app will restart, no need to navigate
      await i18n.changeLanguage(deviceLanguage);
      if (!willRestart) {
        navigation.reset({
          index: 0,
          routes: [{name: ScreenNames.AgeCheck}]
        });
      }
    } catch (e) {
      app.hideActivityIndicator();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(e);
      Alert.alert(
        'Error',
        e.message === networkError ? t('common:networkError') : t('leave:error')
      );
    }
  };

  const confirm = () => {
    Alert.alert(t('leave:confirmTitle'), t('leave:confirmText'), [
      {
        text: t('leave:cancel'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      },
      {
        text: t('leave:confirm'),
        onPress: () => confirmed(),
        style: 'destructive'
      }
    ]);
  };

  return (
    <PinnedBottom heading={t('leave:title')}>
      <View>
        <Markdown style={{}}>{t('leave:info')}</Markdown>
        <Spacing s={32} />
        <DataProtectionLink />
        <Spacing s={32} />
        <Markdown style={{}}>{t(`leave:summary.${Platform.OS}`)}</Markdown>
        <Spacing s={32} />
      </View>
      <Button type="danger" onPress={confirm}>
        {t('leave:button')}
      </Button>
    </PinnedBottom>
  );
};
