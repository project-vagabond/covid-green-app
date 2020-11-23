import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {format} from 'date-fns';
import {SAFETYNET_KEY} from '@env';
import {ENV, TEST_TOKEN} from '@env';
import RNGoogleSafetyNet from 'react-native-google-safetynet';
import RNIOS11DeviceCheck from 'react-native-ios11-devicecheck';
import {getVersion} from 'react-native-exposure-notification-service';

import {CallBackData} from 'components/organisms/phone-number-us';

import {urls} from 'constants/urls';
import {Check, SecureStoreKeys} from 'providers/context';
import {County} from 'assets/counties';
import {
  requestRetry,
  RegisterError,
  identifyNetworkIssue,
  request
} from './connection';

interface CheckIn {
  gender: string;
  race: string;
  ethnicity: string;
  ageRange: string;
  county: string;
  ok: boolean;
}

export const networkError = 'Network Unavailable';

export type UploadResponse = Response | undefined;

export const getDeviceCheckData = async (nonce: string) => {
  if (ENV !== 'production' && TEST_TOKEN) {
    console.log('using test token', TEST_TOKEN);
    return {
      platform: 'test',
      deviceVerificationPayload: TEST_TOKEN
    };
  } else if (Platform.OS === 'android') {
    console.log(SAFETYNET_KEY);
    console.log(urls.api);
    try {
      const deviceVerificationPayload = await RNGoogleSafetyNet.sendAttestationRequestJWT(
        nonce,
        SAFETYNET_KEY
      );
      return {
        platform: 'android',
        deviceVerificationPayload
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  } else {
    return {
      platform: 'ios',
      deviceVerificationPayload: await RNIOS11DeviceCheck.getToken()
    };
  }
};

export async function register(): Promise<{
  token: string;
  refreshToken: string;
}> {
  let nonce;
  try {
    const registerResponse = await request(`${urls.api}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!registerResponse) {
      throw new Error('Invalid response');
    }

    const registerResult = await registerResponse.json();
    nonce = registerResult.nonce;
  } catch (err) {
    console.log('Register error: ', err);
    if (err.json) {
      const errBody = await err.json();
      throw new RegisterError(errBody.message, errBody.code || 1001);
    }
    const codeVal = err.cancelled ? '1006' : await identifyNetworkIssue();
    console.log('Register error code is ', codeVal);
    throw new RegisterError(err.message, codeVal);
  }

  let deviceCheckData;
  try {
    deviceCheckData = await getDeviceCheckData(nonce);
  } catch (err) {
    console.log('Device check error: ', err);
    throw new RegisterError(err.message, '1003');
  }

  console.log(SAFETYNET_KEY);
  console.log(urls.api);
  console.log(deviceCheckData);

  try {
    const verifyResponse = await request(`${urls.api}/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({nonce, ...deviceCheckData})
    });

    if (!verifyResponse) {
      throw new Error('Invalid response');
    }

    const resp = await verifyResponse.json();

    console.log('RESP', resp);

    return resp as {
      token: string;
      refreshToken: string;
    };
  } catch (err) {
    console.log('Register (verify) error:', err);
    if (err.json) {
      const errBody = await err.json();
      throw new RegisterError(errBody.message, errBody.code || 1004);
    }
    throw new RegisterError(err.message, '1005');
  }
}

export async function forget(): Promise<boolean> {
  try {
    saveMetric({event: METRIC_TYPES.FORGET});
    await request(`${urls.api}/register`, {
      authorizationHeaders: true,
      method: 'DELETE'
    });
  } catch (err) {
    console.log('Error forgetting user: ', err);
    return false;
  }

  return true;
}

export async function checkIn(checks: Check[], checkInData: CheckIn) {
  const {gender, race, ethnicity, ageRange, county, ok} = checkInData;

  try {
    const data = checks.map((c) => ({
      ...c.symptoms,
      date: format(c.timestamp, 'dd/MM/yyyy')
    }));

    const body = {
      gender,
      race,
      ethnicity,
      ageRange,
      county,
      ok,
      data
    };

    await request(`${urls.api}/check-in`, {
      authorizationHeaders: true,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    saveMetric({event: METRIC_TYPES.CHECK_IN});
  } catch (err) {
    console.log('Error checking-in:', err);
  }
}

export async function loadSettings() {
  try {
    const req = await requestRetry(`${urls.api}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!req) {
      throw new Error('Invalid response');
    }

    const resp = await req.json();
    return resp;
  } catch (err) {
    console.log('Error loading settings data');
    console.log(err);
    throw err;
  }
}

// export interface CheckIns {
//   total: number;
//   ok: number;
// }

// export type ConfirmedCasesData = [Date, number][];

// export interface CovidStatistics {
//   confirmed: number;
//   deaths: number;
//   recovered: number;
//   hospitalised: number;
//   requiredICU: number;
//   transmission: {
//     community: number;
//     closeContact: number;
//     travelAbroad: number;
//   };
//   lastUpdated: {
//     stats: Date;
//     profile: Date;
//   };
// }

export interface BaseStatRecord {
  cumulative_number_of_positives: number;
  cumulative_number_of_tests: number;
  new_positives: number;
  total_number_of_tests: number;
}

export interface DateData extends BaseStatRecord {
  county: County;
}

export interface CountyAggregateRecord {
  cumulative_number_of_positives: number;
  cumulative_number_of_tests: number;
  last_test_date: string;
}

export interface CountyRecord extends BaseStatRecord {
  test_date: string;
}

export interface CountyStatsData {
  aggregate: {
    [key in County]: CountyAggregateRecord;
  };
  counties: {
    [key in County]: CountyRecord | CountyAggregateRecord;
  };
}

export interface DateStatsData {
  aggregate: {
    [key: string]: BaseStatRecord;
  };
  dates: {
    [key: string]: DateData[];
  };
}

export interface StatsData {
  byCounty: CountyStatsData;
  byDate: DateStatsData;
  // checkIns: CheckIns;
  // statistics: CovidStatistics;
  // chart: ConfirmedCasesData;
  // installs: [Date: number][];
  // counties: {cases: number; county: string}[];
}

export async function loadData(): Promise<StatsData> {
  try {
    const req = await requestRetry(`${urls.api}/stats`, {
      authorizationHeaders: true,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!req) {
      throw new Error('Invalid response');
    }
    const res = await req.json();
    return res as StatsData;
  } catch (err) {
    console.log('Error loading stats data: ', err);
    throw err;
  }
}

export async function uploadContacts(contacts: any) {
  try {
    const req = await request(`${urls.api}/contacts`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contacts)
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    console.log('Contacts Uploaded');
    saveMetric({event: METRIC_TYPES.CONTACT_UPLOAD});
    return true;
  } catch (err) {
    console.log('Error uploading contacts');
    console.log(err);
    throw err;
  }
}

export async function loadNotifications() {
  try {
    const req = await request(`${urls.api}/register`, {
      authorizationHeaders: true,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!req) {
      throw new Error('Invalid response');
    }

    console.log('Loaded record');
    const data = await req.json();
    return data;
  } catch (err) {
    console.log('Error loading record');
    console.log(err);
    throw err;
  }
}

export enum METRIC_TYPES {
  CONTACT_UPLOAD = 'CONTACT_UPLOAD',
  CHECK_IN = 'CHECK_IN',
  FORGET = 'FORGET',
  CALLBACK_OPTIN = 'CALLBACK_OPTIN'
}

// 1.2 downloads, 2,7, 2.6

export async function saveMetric({event = ''}) {
  try {
    const analyticsOptIn = await SecureStore.getItemAsync(
      SecureStoreKeys.analytics
    );
    if (analyticsOptIn !== String(true)) {
      return false;
    }
    const os = Platform.OS;
    const version = await getVersion();
    const req = await request(`${urls.api}/metrics`, {
      authorizationHeaders: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        os,
        version: version.display,
        event
      })
    });

    return req && req.status === 204;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export const uploadCallBackData = async (
  callBackData: CallBackData
): Promise<UploadResponse> => {
  const resp = (await request(`${urls.api}/callback`, {
    authorizationHeaders: true,
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mobile: callBackData.mobile,
      closeContactDate: Date.now() // required field, is forwarded to the lambda
    })
  })) as UploadResponse;

  return resp;
};
