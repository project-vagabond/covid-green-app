import React, {useState, createRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  AccessibilityInfo,
  AccessibilityProps,
  PixelRatio,
  Platform
} from 'react-native';

import {scale, text, colors} from 'theme';

interface SingleCodeInputProps extends AccessibilityProps {
  error?: boolean;
  style?: ViewStyle;
  count: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  code?: string;
}

export const SingleCodeInput: React.FC<SingleCodeInputProps> = ({
  style,
  disabled = false,
  autoFocus = false,
  onChange,
  error,
  count,
  accessibilityHint,
  accessibilityLabel,
  code = ''
}) => {
  const [value, setValue] = useState<string>(code);
  const inputRef = createRef<TextInput>();
  const fontScale = PixelRatio.getFontScale();

  useEffect(() => {
    const isScreenReaderEnabled = (async function () {
      await AccessibilityInfo.isScreenReaderEnabled();
    })();
    if (autoFocus && !isScreenReaderEnabled) {
      inputRef.current?.focus();
    }
  }, [inputRef, autoFocus]);

  const onChangeTextHandler = (v: string) => {
    const validatedValue = v.replace(/[^0-9]/g, '');
    setValue(validatedValue);

    if (!validatedValue) {
      return;
    }

    if (onChange) {
      onChange(validatedValue);
    }
  };

  const onFocusHandler = () => {
    if (error) {
      inputRef.current?.clear();
      inputRef.current?.focus();
      if (onChange) {
        onChange(value);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={inputRef}
        selectTextOnFocus
        autoCapitalize="characters"
        style={[
          styles.input,
          {height: 60 * fontScale},
          error ? styles.errorBlock : styles.block
        ]}
        maxLength={count}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
        editable={!disabled}
        value={value}
        placeholder={'_'.repeat(count)}
        onFocus={onFocusHandler}
        onChangeText={onChangeTextHandler}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    ...text.xxlargeBlack,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    letterSpacing: scale(10),
    backgroundColor: colors.white
  },
  block: {
    color: colors.darkGray,
    borderColor: colors.darkGray
  },
  errorBlock: {
    color: colors.warning,
    borderColor: colors.warning
  }
});
