import React, {FC} from 'react';
import {View} from 'react-native';

import {Spacing} from 'components/atoms/spacing';
import {Markdown} from 'components/atoms/markdown';

interface TextBlockProps {
  text: string;
  spacing?: number;
}

export const TextBlock: FC<TextBlockProps> = ({text, spacing = 20}) => {
  if (!text) {
    // Skip spacing if text is empty
    return null;
  }
  return (
    <>
      <Spacing s={spacing} />
      <View style={styles.flex}>
        <Markdown>{text}</Markdown>
      </View>
      <Spacing s={spacing} />
    </>
  );
};

const styles = {
  flex: {
    flex: 1
  }
};
