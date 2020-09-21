import React, {FC} from 'react';

import {ScreenNames} from 'navigation';
import {AgeCheckTemplate} from './age-check-template';

export const UnderAge: FC<any> = () => {
  return (
    <AgeCheckTemplate
      content="ageCheck:underAge"
      hideButton
      yesScreen={ScreenNames.AgeCheck}
      buttonText="OK"
    />
  );
};
