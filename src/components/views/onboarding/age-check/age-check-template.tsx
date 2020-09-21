import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from 'components/atoms/button';
import {colors, text} from 'theme';
import Icons from 'assets/icons';
import {Scrollable} from 'components/templates/scrollable';

interface AgeCheckTemplateProps {
  yesScreen: string;
  noScreen?: string;
  hideButton?: boolean;
  content: string;
  buttonText: string;
}

export const AgeCheckTemplate: FC<AgeCheckTemplateProps> = ({
  yesScreen,
  noScreen,
  content,
  hideButton,
  buttonText
}: AgeCheckTemplateProps) => {
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
          stroke={colors.purple}
          fill={colors.purple}
        />
      </View>
      <View style={style.bodyContainer}>
        <Text accessible accessibilityLabel={t(content)} style={style.content}>
          {t(content)}
        </Text>
        <Button
          style={{...style.button, ...style.yesButton}}
          onPress={() => nav.navigate(yesScreen)}>
          {buttonText}
        </Button>
        {hideButton ? null : (
          <Button
            style={style.button}
            type="empty"
            onPress={() => nav.navigate(noScreen)}>
            No
          </Button>
        )}
      </View>
    </Scrollable>
  );
};

const style = StyleSheet.create({
  page: {
    display: 'flex',
    alignItems: 'center'
  },
  logoContainer: {
    height: 500,
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
    maxHeight: 60,
    marginBottom: 30
  },
  button: {
    width: '100%'
  },
  yesButton: {
    marginBottom: 20
  }
});
