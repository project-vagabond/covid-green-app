import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Button} from 'components/atoms/button';
import {colors, text} from 'theme';
import Icons from 'assets/icons';
import {Scrollable} from 'components/templates/scrollable';
import {ScreenNames} from 'navigation';
import {PinnedBottom} from 'components/templates/pinned';
const HealthLogo = require('assets/images/healthStateLogo/image.png');

export const AgeCheck: FC<{}> = () => {
  const {t} = useTranslation();
  const nav = useNavigation();

  return (
    <PinnedBottom style={style.container}>
      <View style={style.page}>
        <View
          accessible
          accessibilityLabel="Covid Alert NY logo"
          accessibilityRole="image"
          style={style.logoContainer}>
          <Icons.LogoLaunch
            width={180}
            height={180}
            stroke={colors.white}
            fill={colors.white}
          />
        </View>
        <View style={style.bodyContainer}>
          <Text
            accessible
            accessibilityLabel={t('ageCheck:intro')}
            style={style.content}>
            {t('ageCheck:intro')}
          </Text>
          <Button
            type="empty"
            style={style.button}
            onPress={() => nav.navigate(ScreenNames.Introduction)}>
            {t('ageCheck:confirm')}
          </Button>
        </View>
      </View>
      <View>
        <Image accessibilityIgnoresInvertColors source={HealthLogo} />
      </View>
    </PinnedBottom>
  );
};

const style = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'center'
  },
  bodyContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25
  },
  content: {
    ...text.xlarge,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.white
  },
  button: {
    width: '100%',
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  container: {
    paddingHorizontal: 0,
    paddingTop: 40,
    backgroundColor: colors.purple
  },
  logoContainer: {
    alignItems: 'center'
  }
});
