import React, {useState, createRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  AccessibilityInfo,
  AccessibilityProps,
  PixelRatio,
  Platform,
  LayoutChangeEvent
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
  const [containerWidth, setContainerWidth] = useState(280);

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

  const hasLongCode = count > 10;

  const onLayoutHandler = ({
    nativeEvent: {
      layout: {width}
    }
  }: LayoutChangeEvent) => {
    setContainerWidth(width);
  };

  // Distribute characters based on approximate available horizontal space
  const spacePerChar = scale(hasLongCode ? 14 : 26);
  const letterSpacing = Math.max(
    0,
    (containerWidth - count * spacePerChar) / (count + 1)
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayoutHandler}>
      <TextInput
        ref={inputRef}
        selectTextOnFocus
        autoFocus={true}
        autoCapitalize="characters"
        style={[
          styles.input,
          hasLongCode ? styles.inputLong : styles.inputShort,
          {height: 60 * fontScale, letterSpacing},
          error ? styles.errorBlock : styles.block
        ]}
        maxLength={count}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
        editable={!disabled}
        value={value}
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
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 0,
    borderWidth: 1,
    backgroundColor: colors.white
  },
  inputLong: {
    ...text.defaultBold
  },
  inputShort: {
    ...text.xxlargeBlack
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
