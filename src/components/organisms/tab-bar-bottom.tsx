import React, {ReactNode, FC} from 'react';
import {StyleSheet, View, TouchableWithoutFeedback, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import Constants from 'expo-constants';

import {colors, text} from 'theme';
import {TabBarIcons} from 'assets/icons';
import {
  useExposure,
  StatusState
} from 'react-native-exposure-notification-service';

interface Tab {
  label: string;
  icon: {
    active: ReactNode;
    inactive: ReactNode;
    unknown?: ReactNode;
  };
}

const getIcon = (tab: Tab, active: Boolean, status: String) => {
  if (status === StatusState.unknown && tab.icon.unknown) {
    return tab.icon.unknown;
  }
  if (active) {
    return tab.icon.active;
  }
  if (!active) {
    return tab.icon.inactive;
  }
  return tab.icon.inactive;
};

const ctOnUnselected = (
  <TabBarIcons.ContactTracing.On
    width={32}
    height={24}
    color={colors.darkGray}
  />
);
const ctOffUnselected = (
  <TabBarIcons.ContactTracing.Off
    width={32}
    height={24}
    color={colors.darkGray}
  />
);
const ctOnSelected = (
  <TabBarIcons.ContactTracing.On width={32} height={24} color={colors.purple} />
);
const ctOffSelected = (
  <TabBarIcons.ContactTracing.Off
    width={32}
    height={24}
    color={colors.darkGray}
  />
);

const ctUnknown = (
  <TabBarIcons.ContactTracing.Unknown
    width={32}
    height={24}
    color={colors.darkGray}
  />
);

const barChartInactive = (
  <TabBarIcons.Updates width={32} height={24} color={colors.darkGray} />
);
const barChartActive = (
  <TabBarIcons.Updates width={32} height={24} color={colors.purple} />
);

const checkInactive = (
  <TabBarIcons.CheckIn width={32} height={24} color={colors.darkGray} />
);
const checkActive = (
  <TabBarIcons.CheckIn width={32} height={24} color={colors.purple} />
);

/**
 * The component assumes the order of the <Tab /> components in the BottomNavigation is correct.
 * No need for a generic approach... yet.
 */
export const TabBarBottom: FC<any> = ({navigation, state}) => {
  const {t} = useTranslation();
  const {status, enabled} = useExposure();

  const tabItems = [
    {
      label: t('tabBar:updates'),
      icon: {
        inactive: barChartInactive,
        active: barChartActive
      }
    },
    {
      label: t('tabBar:symptomCheck'),
      icon: {
        inactive: checkInactive,
        active: checkActive
      }
    },
    {
      label: t('tabBar:contactTracing'),
      icon: {
        inactive:
          status.state === StatusState.active && enabled
            ? ctOnUnselected
            : ctOffUnselected,
        active:
          status.state === StatusState.active && enabled
            ? ctOnSelected
            : ctOffSelected,
        unknown: ctUnknown
      }
    },
    {
      label: t('tabBar:settings'),
      icon: {
        active: (
          <TabBarIcons.Settings width={32} height={24} color={colors.purple} />
        ),
        inactive: (
          <TabBarIcons.Settings
            width={32}
            height={24}
            color={colors.darkGray}
          />
        )
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabItems.map((tab, index) => {
          const isActive = state.index === index;
          const routeName = state.routes[index] && state.routes[index].name;
          return (
            <TouchableWithoutFeedback
              key={`tab-bar-item-${index}`}
              onPress={() => navigation.navigate(routeName)}>
              <View style={[styles.tab, isActive ? styles.highlighted : {}]}>
                {getIcon(tab, isActive, status.state)}
                <Text
                  allowFontScaling={false}
                  style={[styles.label, isActive && styles.labelActive]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingBottom: Constants.statusBarHeight === 44 ? 34 : 0
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 0,
    borderTopColor: colors.gray,
    borderTopWidth: 2
  },
  tab: {
    width: '25%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  label: {
    ...text.smallBold,
    lineHeight: 14,
    letterSpacing: -0.35,
    paddingTop: 2,
    textAlign: 'center'
  },
  labelActive: {
    color: colors.text
  },
  highlighted: {
    backgroundColor: colors.tabs.highlighted,
    borderStyle: 'solid',
    borderTopWidth: 2,
    borderColor: colors.purple,
    borderRadius: 0,
    paddingTop: 4,
    paddingBottom: 4
  }
});