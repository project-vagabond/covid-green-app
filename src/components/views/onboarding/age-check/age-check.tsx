import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Button} from 'components/atoms/button';
import {colors, text} from 'theme';
import Icons from 'assets/icons';
import {Scrollable} from 'components/templates/scrollable';
import {ScreenNames} from 'navigation';
const HealthLogo = require('assets/images/healthStateLogo/image.png');

export const AgeCheck: FC<{}> = () => {
  const {t} = useTranslation();
  const nav = useNavigation();

  return (
    <Scrollable scrollStyle={style.page}>
      <View
        accessible
        accessibilityLabel="Covid Alert NY logo"
        accessibilityRole="image"
        style={style.logoContainer}>
        <Icons.LogoLaunch
          width={242}
          height={242}
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
      <View style={style.stateLogo}>
        <Image accessibilityIgnoresInvertColors source={HealthLogo} />
      </View>
    </Scrollable>
  );
};

const style = StyleSheet.create({
  page: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.purple,
    height: '100%'
  },
  logoContainer: {
    height: 400,
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

  stateLogo: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center'
  }
});
