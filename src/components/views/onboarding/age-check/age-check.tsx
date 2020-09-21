import React, {FC} from 'react';
import {ScreenNames} from 'navigation';
import {AgeCheckTemplate} from './age-check-template';

export const AgeCheck: FC<any> = () => {
  return (
    <AgeCheckTemplate
      content="ageCheck:intro"
      yesScreen={ScreenNames.Permissions}
      noScreen={ScreenNames.ParentConsent}
      buttonText="Yes"
    />
  );
};
