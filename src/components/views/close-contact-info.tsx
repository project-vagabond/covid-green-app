import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import {getRenderListBullet, Markdown} from 'components/atoms/markdown';
import {Scrollable} from 'components/templates/scrollable';
import {KeepSafeIcons} from 'assets/icons';
import {Linking} from 'react-native';
import {CallCard} from 'components/molecules/call-card';

const renderListBullet = getRenderListBullet(KeepSafeIcons);

export const CloseContactInfo: FC = () => {
  const {t} = useTranslation();
  return (
    <Scrollable heading={t('closeContactInfo:title')}>
      <Markdown style={styles.mdTop}>{t('closeContactInfo:info')}</Markdown>
      <Markdown style={styles.md} renderListBullet={renderListBullet}>
        {t('closeContactInfo:list')}
      </Markdown>
      <CallCard
        onPress={() => Linking.openURL('tel:18332084159')}
        message={t('checker:results:callHelp')}
      />
    </Scrollable>
  );
};

const styles = StyleSheet.create({
  mdTop: {
    marginBottom: 0
  },
  md: {
    marginBottom: 32
  }
});
