import {backOff} from 'exponential-backoff';
import {fetch as fetchPinned} from 'react-native-ssl-pinning';
import AsyncStorage from '@react-native-community/async-storage';
import * as SecureStore from 'expo-secure-store';

import {isMountedRef, navigationRef, ScreenNames} from '../../navigation';

import {urls} from 'constants/urls';
import {SecureStoreKeys} from 'providers/context';
import {networkError} from '.';

// Strip any trailing '/' if there is one
const match = urls.api.match(/^(.*?)\/?$/);
const cleanedUrl = match ? `${match[1]}` : null;

export class RegisterError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.name = 'RegisterError';
    // @ts-ignore
    this.code = code;
  }
}

async function createToken(): Promise<string> {
  try {
    const refreshToken = await SecureStore.getItemAsync(
      SecureStoreKeys.refreshToken
    );

    const req = await request(`${urls.api}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      },
      body: JSON.stringify({})
    });
    if (!req) {
      throw new Error('Invalid response');
    }
    const resp = await req.json();

    if (!resp.token) {
      throw new Error('Error getting token');
    }

    await SecureStore.setItemAsync(SecureStoreKeys.token, resp.token);

    return resp.token;
  } catch (err) {
    if (isMountedRef.current && navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{name: ScreenNames.Introduction}]
      });
    }
    return '';
  }
}

export const request = async (url: string, cfg: any) => {
  const {authorizationHeaders = false, ...config} = cfg;

  if (authorizationHeaders) {
    let bearerToken = await SecureStore.getItemAsync(SecureStoreKeys.token);
    if (!bearerToken) {
      bearerToken = await createToken();
    }

    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${bearerToken}`;
  }

  let isUnauthorised;
  let resp;
  try {
    resp = await fetchPinned(url, {
      ...config,
      timeoutInterval: 30000,
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
    isUnauthorised = resp && resp.status === 401;
  } catch (e) {
    if (!authorizationHeaders || e.status !== 401) {
      const issue = await identifyNetworkIssue();
      if (issue.split(':')[0] === '1012') {
        throw new Error(networkError);
      }
      throw e;
    }
    isUnauthorised = true;
  }

  if (authorizationHeaders && isUnauthorised) {
    let newBearerToken = await createToken();
    const newConfig = {
      ...config,
      headers: {...config.headers, Authorization: `Bearer ${newBearerToken}`}
    };

    return fetchPinned(url, {
      ...newConfig,
      timeoutInterval: 30000,
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
  }

  return resp;
};

export async function requestRetry(
  url: string,
  cfg: any,
  retries: number = 3,
  startingDelay = 2000
) {
  return backOff(() => request(url, cfg), {
    numOfAttempts: retries,
    startingDelay,
    timeMultiple: 2
  });
}

export async function requestWithCache<T extends unknown>(
  cacheKey: string,
  loadFunc: () => Promise<T>
) {
  try {
    const data = await loadFunc();
    // try caching the data
    try {
      console.log(`Saving ${cacheKey} data in storage...`);
      AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.log(`Error writing "${cacheKey}" in storage:`, err);
    }

    return {data};
  } catch (error) {
    console.log(`Error loading "${cacheKey}" data: `, error);

    let data = null;

    // try loading data from cache
    try {
      console.log(`Loading "${cacheKey}" data from storage...`);
      const storageData = await AsyncStorage.getItem(cacheKey);
      if (storageData) {
        data = JSON.parse(storageData) as T;
      }
    } catch (err) {
      console.log(`Error reading "${cacheKey}" from storage:`, err);
    }

    return {
      data,
      error: error instanceof Error ? error : new Error(error)
    };
  }
}

export const identifyNetworkIssue = async (): Promise<string> => {
  if (!cleanedUrl) {
    console.error('API_HOST URL is missing from build environment variables');
    return '1015';
  }
  const headers = {};
  let resp;

  try {
    resp = await fetch(`${cleanedUrl}/healthcheck`, {
      method: 'GET',
      headers
    });
    if (resp.status !== 204) {
      return `1008:${resp.status}`;
    }
    console.log('NF check:', resp.status, resp.statusText);
  } catch (e) {
    console.log('identifyNetworkIssue - nf check', e);
    return `1012:${e.message}`;
  }

  try {
    resp = await fetchPinned(`${cleanedUrl}/settings/language`, {
      timeoutInterval: 30000,
      method: 'GET',
      sslPinning: {
        certs: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5']
      }
    });
    if (resp.status !== 200) {
      return `1009:${resp.status}`;
    }
    console.log('NF with pinning:', resp.status, resp.text);

    //if we get here it means we havn't discovered the error
    return '1015';
  } catch (e) {
    console.log(e);
    if (e === 'cancelled') {
      // cert pinning failed
      return '1013';
    } else {
      const errData = await e.json();
      console.log('identifyNetworkIssue - nf pinned', errData);
      return `1010:${errData.statusCode}`;
    }
  }
};
