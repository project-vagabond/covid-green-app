import React, {ReactNode, FC} from 'react';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {colors, shadows} from 'theme';
import {AppIcons} from 'assets/icons';

interface CardProps {
  type?: 'warning' | 'info';
  padding?: {
    h?: number;
    v?: number;
    r?: number;
  };
  icon?: ReactNode;
  onPress?: () => void;
}

export const Card: FC<CardProps> = ({
  type,
  padding: {h = 24, v = 20, r} = {},
  icon,
  onPress,
  children
}) => {
  const padding = {
    paddingHorizontal: h,
    paddingVertical: v,
    ...(r !== undefined && {paddingRight: r})
  };
  const isWarning = type === 'warning';
  const isInfo = type === 'info';
  const cardContent = (
    <View
      style={[
        styles.card,
        isWarning && styles.cardWarning,
        isInfo && styles.cardInfo,
        padding
      ]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.childrenView}>{children}</View>
      {onPress && (
        <View style={styles.row}>
          <AppIcons.ArrowRight
            width={18}
            height={18}
            color={isWarning || isWarning ? colors.white : colors.text}
          />
        </View>
      )}
    </View>
  );
  return onPress ? (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={onPress}>
      {cardContent}
    </TouchableWithoutFeedback>
  ) : (
    cardContent
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    ...shadows.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardWarning: {
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: colors.red
  },
  cardInfo: {
    borderWidth: 1,
    borderColor: colors.info.border,
    backgroundColor: colors.info.primary
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  arrowIcon: {
    width: 24,
    height: 24
  },
  childrenView: {
    flex: 1
  }
});