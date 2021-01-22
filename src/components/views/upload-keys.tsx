import React, {useState, useEffect, useCallback, FC} from 'react';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {useTranslation} from 'react-i18next';
import {NavigationProp, RouteProp} from '@react-navigation/native';
import {useExposure} from 'react-native-exposure-notification-service';

import {ScreenNames} from 'navigation';
import {useApplication, SecureStoreKeys} from 'providers/context';
import {useSettings} from 'providers/settings';
import {
  validateCode,
  uploadExposureKeys,
  ValidationResult
} from 'services/api/exposures';

import {Spacing} from 'components/atoms/layout';
import {Button} from 'components/atoms/button';
import {Markdown} from 'components/atoms/markdown';
import {
  SingleCodeInput,
  CODE_INPUT_LENGTHS
} from 'components/molecules/single-code-input';
import {Toast} from 'components/atoms/toast';
import {ResultCard} from 'components/molecules/result-card';
import {KeyboardScrollable} from 'components/templates/keyboard-scrollable';
import {useFocusRef, setAccessibilityFocusRef} from 'hooks/accessibility';

import {colors, baseStyles} from 'theme';
import {AppIcons} from 'assets/icons';

type UploadStatus =
  | 'initialising'
  | 'validate'
  | 'upload'
  | 'uploadOnly'
  | 'success'
  | 'permissionError'
  | 'error';

export const UploadKeys: FC<{
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
}> = ({navigation, route}) => {
  const {t} = useTranslation();
  const {getDiagnosisKeys} = useExposure();
  const {
    showActivityIndicator,
    hideActivityIndicator,
    pendingCode,
    setContext,
    user
  } = useApplication();
  const {
    appConfig: {ignore6DigitCode}
  } = useSettings();

  const [status, setStatus] = useState<UploadStatus>('initialising');

  const paramsCode = route.params?.c;
  const presetCode = paramsCode || pendingCode || '';

  const [code, setCode] = useState(presetCode);
  const [previousPresetCode, setPreviousPresetCode] = useState(presetCode);
  const [validationError, setValidationError] = useState<string>('');

  const [uploadToken, setUploadToken] = useState('');
  const [symptomDate, setSymptomDate] = useState('');
  const [uploadRef, errorRef, okayRef] = useFocusRef({
    timeout: 1000,
    count: 3
  });

  const isRegistered = !!user;

  const updateCode = useCallback((input: string) => {
    setValidationError('');
    setCode(input);
  }, []);

  useEffect(() => {
    const readUploadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(
          SecureStoreKeys.uploadToken
        );
        const storedSymptomDate = await SecureStore.getItemAsync(
          SecureStoreKeys.symptomDate
        );
        if (token && storedSymptomDate) {
          setUploadToken(token);
          setSymptomDate(storedSymptomDate);
          setStatus('uploadOnly');
          return;
        }
      } catch (e) {}

      setStatus('validate');
    };
    readUploadToken();

    if (!isRegistered && paramsCode && !pendingCode) {
      // Store code so we can bring new user back with it they onboard
      setContext({pendingCode: paramsCode});
    }

    // Call hideActivityIndicator on screen dismount: prevent hard-to replicate
    // bug where screen re-opening from deep link might leave spinner active
    return hideActivityIndicator;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ // Run this only once
  }, []);

  useEffect(() => {
    // Apply new params code if deep link used while screen is already open
    if (presetCode !== previousPresetCode) {
      setPreviousPresetCode(presetCode);
      if (presetCode) {
        updateCode(presetCode);
      }
    }
  }, [updateCode, presetCode, previousPresetCode]);

  const codeValidationHandler = useCallback(
    async (ignoreError: boolean) => {
      if (!ignoreError) {
        showActivityIndicator();
      }

      console.log(`Validating ${code.length} character code...`);
      const {result, symptomDate: newSymptomDate, token} = await validateCode(
        code
      );

      hideActivityIndicator();

      if (result !== ValidationResult.Valid) {
        let errorMessage;
        if (result === ValidationResult.NetworkError) {
          errorMessage = t('common:networkError');
        } else if (result === ValidationResult.Expired) {
          errorMessage = t('uploadKeys:code:expiredError');
        } else if (result === ValidationResult.Invalid) {
          errorMessage = t('uploadKeys:code:invalidError');
        } else {
          errorMessage = t('uploadKeys:code:error');
        }

        console.log(
          `${code.length}-character code validation ${
            errorMessage
              ? `failed with ${
                  ignoreError ? 'ignored ' : ''
                }error "${errorMessage}"`
              : 'passed'
          }`
        );

        if (!ignoreError) {
          setValidationError(errorMessage);
          setTimeout(() => {
            setAccessibilityFocusRef(errorRef);
          }, 550);
        }
        return;
      }

      try {
        await SecureStore.setItemAsync(SecureStoreKeys.uploadToken, token!);
        await SecureStore.setItemAsync(
          SecureStoreKeys.symptomDate,
          newSymptomDate!
        );
      } catch (e) {
        console.log('Error (secure) storing upload token', e);
      }
      setValidationError('');

      setUploadToken(token!);
      setSymptomDate(newSymptomDate!);
      setStatus('upload');
      setTimeout(() => {
        setAccessibilityFocusRef(uploadRef);
      }, 250);
    } /* eslint-disable-next-line react-hooks/exhaustive-deps */, // errorRef and uploadRef are stable
    [code, showActivityIndicator, hideActivityIndicator, t]
  );

  useEffect(() => {
    if (isRegistered) {
      if (CODE_INPUT_LENGTHS.includes(code.length)) {
        const isPreset = presetCode && code === presetCode;
        codeValidationHandler(!isPreset);
      } else {
        setValidationError('');
      }
    }
  }, [ignore6DigitCode, code, presetCode, codeValidationHandler, isRegistered]);

  const uploadDataHandler = async () => {
    let exposureKeys;
    try {
      exposureKeys = await getDiagnosisKeys();
    } catch (err) {
      console.log('getDiagnosisKeys error:', err);
      return setStatus('permissionError');
    }

    try {
      showActivityIndicator();
      await uploadExposureKeys(uploadToken, symptomDate, exposureKeys);
      hideActivityIndicator();

      setStatus('success');
    } catch (err) {
      console.log('error uploading exposure keys:', err);
      hideActivityIndicator();

      setStatus('error');
    }

    try {
      await SecureStore.deleteItemAsync(SecureStoreKeys.uploadToken);
      await SecureStore.deleteItemAsync(SecureStoreKeys.symptomDate);
    } catch (e) {}
  };

  const renderValidation = () => {
    // Remount and clear input if a new presetCode is provided
    const inputKey = `code-input-${previousPresetCode}`;

    const okayDisabled = !(
      status === 'validate' &&
      code.length &&
      !validationError
    );

    const onDoneHandler = () =>
      (validationError && setAccessibilityFocusRef(errorRef)) ||
      (!okayDisabled && setAccessibilityFocusRef(okayRef));

    return (
      <View key={inputKey}>
        <Markdown markdownStyles={{block: {marginBottom: 24}}}>
          {t('uploadKeys:code:intro', {
            length: ignore6DigitCode ? '8-digit' : '6 or 8 digit'
          })}
        </Markdown>
        <View style={styles.row}>
          <View style={styles.flex}>
            <SingleCodeInput
              error={!!validationError}
              onChange={updateCode}
              disabled={status !== 'validate'}
              accessibilityHint={t('uploadKeys:code:hint')}
              accessibilityLabel={t('uploadKeys:code:label')}
              code={code}
              onDone={onDoneHandler}
            />
          </View>
          <View
            importantForAccessibility={
              okayDisabled ? 'no-hide-descendants' : 'auto'
            }
            accessibilityElementsHidden={okayDisabled}>
            <TouchableOpacity
              style={[styles.okayButton, okayDisabled && styles.okayDisabled]}
              onPress={() => codeValidationHandler(false)}
              disabled={okayDisabled}
              ref={okayRef}
              accessible={!okayDisabled}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('common:ok:label')}>
              {status === 'upload' ? (
                <AppIcons.Success
                  width={24}
                  height={24}
                  color={colors.icons.gray}
                />
              ) : (
                <View style={styles.arrowOffset}>
                  <AppIcons.ArrowRight
                    width={21}
                    height={21}
                    color={colors.white}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {!!validationError && (
          <>
            <Spacing s={8} />
            <Text ref={errorRef} style={baseStyles.error}>
              {validationError}
            </Text>
          </>
        )}
        <Spacing s={status === 'upload' ? 16 : 96} />
      </View>
    );
  };

  const renderUpload = () => {
    return (
      <>
        <View accessible={true} ref={uploadRef}>
          <Markdown>{t('uploadKeys:upload:intro')}</Markdown>
        </View>
        <Spacing s={8} />
        <Button type="default" onPress={uploadDataHandler}>
          {t('uploadKeys:upload:button')}
        </Button>
        <Spacing s={16} />
      </>
    );
  };

  const renderPermissionError = () => {
    return (
      <>
        <Toast
          type="error"
          message={t('uploadKeys:permissionError')}
          icon={<AppIcons.ErrorWarning width={24} height={24} />}
        />
        <Spacing s={8} />
      </>
    );
  };

  const renderUploadError = () => {
    return (
      <>
        <Toast
          type="error"
          message={t('uploadKeys:uploadError')}
          icon={<AppIcons.ErrorWarning width={24} height={24} />}
        />
        <Spacing s={8} />
      </>
    );
  };

  const renderUploadSuccess = () => (
    <ResultCard
      icon
      messageTitle={t('uploadKeys:uploadSuccess:toast')}
      message={t('uploadKeys:uploadSuccess:thanks')}
      buttonType={'default'}
      buttonText={t('uploadKeys:uploadSuccess:updates')}
      onButtonPress={() => navigation.navigate('main', {screen: 'dashboard'})}
      markdownStyle={styles.markdownStyle}
    />
  );

  let headerError =
    status === 'permissionError'
      ? renderPermissionError()
      : status === 'error'
      ? renderUploadError()
      : null;

  if (!isRegistered) {
    navigation.reset({
      index: 0,
      routes: [{name: ScreenNames.AgeCheck}]
    });
    return null;
  }

  return (
    <KeyboardScrollable
      safeArea={true}
      headingShort
      backgroundColor={colors.background}
      heading={t('uploadKeys:title')}
      toast={headerError}>
      {(status === 'validate' || status === 'upload') && renderValidation()}
      {(status === 'upload' ||
        status === 'uploadOnly' ||
        status === 'error' ||
        status === 'permissionError') &&
        renderUpload()}
      {status === 'success' && renderUploadSuccess()}
    </KeyboardScrollable>
  );
};

const styles = StyleSheet.create({
  markdownStyle: {
    backgroundColor: colors.white
  },
  successText: {
    marginTop: 16,
    marginBottom: 16
  },
  codeInput: {
    marginTop: -12
  },
  flex: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  okayButton: {
    backgroundColor: colors.purple,
    width: 48,
    height: 48,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderColor: colors.softPurple,
    borderWidth: 10
  },
  okayDisabled: {
    backgroundColor: colors.icons.gray,
    borderColor: 'transparent'
  },
  arrowOffset: {
    marginLeft: -10
  }
});
