import React, {ReactNode, FC} from 'react';
import {StyleSheet, View, TouchableWithoutFeedback, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors, text} from 'theme';
import {TabBarIcons} from 'assets/icons';
import {
  useExposure,
  StatusState
} from 'react-native-exposure-notification-service';
import {useSafeArea} from 'react-native-safe-area-context';

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
    color={colors.purple}
  />
);

const ctAlert = (
  <TabBarIcons.ContactTracing.Alert
    width={32}
    height={24}
    color={colors.warning}
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
  const {initialised, status, enabled, contacts} = useExposure();
  const insets = useSafeArea();

  const hasAlerts = contacts && contacts.length > 0;

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
        inactive: hasAlerts
          ? ctAlert
          : !initialised || (status.state === StatusState.active && enabled)
          ? ctOnUnselected
          : ctOffUnselected,
        active: hasAlerts
          ? ctAlert
          : !initialised || (status.state === StatusState.active && enabled)
          ? ctOnSelected
          : ctOffSelected
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
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <View accessibilityRole="tablist" style={styles.tabBar}>
        {tabItems.map((tab, index) => {
          const isActive = state.index === index;
          const isAlertsActive = isActive && index === 2 && hasAlerts;
          const routeName = state.routes[index] && state.routes[index].name;
          const hint = [`${index + 1} of ${tabItems.length}`, tab.hint].join(
            ','
          );

          return (
            <TouchableWithoutFeedback
              key={`tab-bar-item-${index}`}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityHint={hint}
              accessibilityState={{selected: isActive}}
              onPress={() => navigation.navigate(routeName)}>
              <View
                style={[
                  styles.tab,
                  isActive ? styles.highlighted : {},
                  isAlertsActive && styles.alertsActive
                ]}>
                {getIcon(tab, isActive, status.state)}
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isAlertsActive && styles.warningText
                  ]}>
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
    backgroundColor: colors.white
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
    borderStyle: 'solid',
    borderTopWidth: 2,
    borderColor: colors.white,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 4
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
    borderColor: colors.purple
  },
  alertsActive: {
    backgroundColor: colors.tabs.alertsHighlighted,
    borderColor: colors.warning
  },
  warningText: {
    color: colors.warningText
  }
});
