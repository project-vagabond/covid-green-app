import React, {FC} from 'react';

import {ScreenNames} from 'navigation';
import {AgeCheckTemplate} from './age-check-template';

export const ParentConsent: FC<any> = () => {
  return (
    <AgeCheckTemplate
      content="ageCheck:parentConsent"
      yesScreen={ScreenNames.Permissions}
      noScreen={ScreenNames.UnderAge}
      buttonText="Yes"
    />
  );
};
