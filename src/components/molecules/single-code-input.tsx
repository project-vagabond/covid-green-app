import React, {useState, createRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  AccessibilityProps,
  PixelRatio,
  Platform,
  LayoutChangeEvent,
  Keyboard
} from 'react-native';

import {useApplication} from 'providers/context';

import {scale, text, colors} from 'theme';

interface SingleCodeInputProps extends AccessibilityProps {
  error?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  code?: string;
  onDone?: () => void;
}

export const CODE_INPUT_LENGTHS = [8, 16];

const count = CODE_INPUT_LENGTHS[CODE_INPUT_LENGTHS.length - 1];

export const SingleCodeInput: React.FC<SingleCodeInputProps> = ({
  style,
  disabled = false,
  onChange,
  onDone,
  error,
  accessibilityHint,
  accessibilityLabel,
  code = ''
}) => {
  const [value, setValue] = useState<string>(code);
  const inputRef = createRef<TextInput>();
  const fontScale = PixelRatio.getFontScale();
  const [containerWidth, setContainerWidth] = useState(280);

  const {
    accessibility: {screenReaderEnabled}
  } = useApplication();

  const onChangeTextHandler = (v: string) => {
    // 16-digit codes are alphanumeric: commenting out to allow their copy-paste
    // const validatedValue = v.replace(/[^0-9]/g, '');

    // autoCapitalize rarely works on Android; longstanding RN bug
    const validatedValue = `${v}`.toUpperCase();

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

  const hasLongCode = code.length && code.length > CODE_INPUT_LENGTHS[0];
  const nextLength = CODE_INPUT_LENGTHS.find((l) => l >= code.length) || count;

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
    (containerWidth - nextLength * spacePerChar) / (nextLength + 1)
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayoutHandler}>
      <TextInput
        ref={inputRef}
        selectTextOnFocus
        autoFocus={!screenReaderEnabled}
        autoCapitalize="characters"
        style={[
          styles.input,
          hasLongCode ? styles.inputLong : styles.inputShort,
          {height: 60 * fontScale, letterSpacing},
          error ? styles.errorBlock : styles.block
        ]}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          onDone();
        }}
        maxLength={count}
        keyboardType={hasLongCode ? 'ascii-capable' : 'number-pad'}
        returnKeyType="done"
        blurOnSubmit={true}
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
