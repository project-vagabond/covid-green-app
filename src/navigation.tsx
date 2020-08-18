import React, {MutableRefObject} from 'react';
import {NavigationContainerRef} from '@react-navigation/native';

export const isMountedRef = React.createRef<boolean>() as MutableRefObject<
  boolean
>;

export const navigationRef = React.createRef<NavigationContainerRef | null>() as MutableRefObject<NavigationContainerRef | null>;

export enum ScreenNames {
  Introduction = 'introduction',
  Permissions = 'permissions',
  Completion = 'completion',
  Tour = 'tour',

  Dashboard = 'dashboard',
  Settings = 'settings'
}