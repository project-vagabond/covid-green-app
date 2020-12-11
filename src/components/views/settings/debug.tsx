import React, {useState, useEffect, useCallback} from 'react';
import {
  NativeEventEmitter,
  ScrollView,
  Text,
  View,
  Alert,
  StyleSheet
} from 'react-native';
import ExposureNotification, {
  CloseContact
} from 'react-native-exposure-notification-service';
import {format} from 'date-fns';

import {Button} from 'components/atoms/button';
import {useExposure} from 'react-native-exposure-notification-service';
import {Scrollable} from 'components/templates/scrollable';

const emitter = new NativeEventEmitter(ExposureNotification);

export const Debug = () => {
  const exposure = useExposure();
  const [events, setLog] = useState([]);
  const [contacts, setContacts] = useState<CloseContact[] | null>([]);
  const [logData, setLogData] = useState<Record<string, any> | null>(null);

  const loadData = useCallback(async () => {
    const newContacts = await exposure.getCloseContacts();

    const newLogData = await exposure.getLogData();
    console.log('logdata is', newLogData);
    const runDates = newLogData?.lastRun;
    if (runDates && typeof runDates === 'string') {
      const dates = runDates
        .replace(/^,/, '')
        .split(',')
        .map((d) => {
          // eslint-disable-next-line radix
          return format(parseInt(d), 'dd/MM HH:mm:ss');
        });
      newLogData.lastRun = dates.join(', ');
    } else {
      newLogData.lastRun
        ? format(newLogData.lastRun, 'dd/MM HH:mm:ss')
        : 'Unknown';
    }

    setLogData(newLogData);
    console.log('logdata', newLogData);
    console.log(
      'has api message',
      Boolean(newLogData.lastApiError && newLogData.lastApiError.length)
    );

    setContacts(newContacts);
    console.log('contacts', newContacts);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ // don't update as exposure does
  }, [setLogData, setContacts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleEvent(ev: {status?: any; scheduledTask?: any} = {}) {
    events.push(ev);
    setLog([...events]);
  }

  const simulateExposure = async () => {
    exposure.simulateExposure(5);
  };

  const checkExposure = async () => {
    try {
      setLog([]);
      subscription.remove();
      emitter.removeListener('exposureEvent', handleEvent);
    } catch (e) {}
    let subscription = emitter.addListener('exposureEvent', handleEvent);
    await exposure.checkExposure(true, true);
  };

  useEffect(() => {
    function handleSilentEvent(ev) {
      if (ev.exposure || (ev.info && ev.info.includes('saveDailyMetric'))) {
        loadData();
      }
    }

    let subscription = emitter.addListener('exposureEvent', handleSilentEvent);

    return () => {
      try {
        subscription.remove();
      } catch (e) {
        console.log('Remove error', e);
      }
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ // run once on screen load
  }, []);

  const deleteAllData = async () => {
    Alert.alert('Delete Data', 'Are you asure you want to delete all data.', [
      {
        text: 'No',
        onPress: () => console.log('No Pressed'),
        style: 'cancel'
      },
      {
        text: 'Yes',
        onPress: async () => {
          setLog([]);
          await exposure.deleteAllData();
          setContacts([]);
          setLogData(null);
          await exposure.configure(); // reconfigure as delete all deletes sharedprefs on android
        },
        style: 'cancel'
      }
    ]);
  };

  const displayContact = (contact) => {
    const aDay = 24 * 60 * 60 * 1000;

    const contactDate =
      contact.exposureAlertDate - contact.daysSinceLastExposure * aDay;
    const displayData = [
      `When: ${format(contact.exposureAlertDate, 'dd/MM HH:mm')}`,
      `Last: ${format(contactDate, 'dd/MM')}`,
      `Score: ${contact.maxRiskScore}`,
      `Keys: ${contact.matchedKeyCount}`,
      `Durations: ${contact.attenuationDurations}`
    ];

    if (contact.maximumRiskScoreFullRange) {
      displayData.push(
        `maximumRiskScoreFullRange: ${contact.maximumRiskScoreFullRange}`
      );
      displayData.push(
        `riskScoreSumFullRange: ${contact.riskScoreSumFullRange}`
      );
      displayData.push(
        `customAttenuationDurations: ${contact.customAttenuationDurations}`
      );
    }

    if (contact.details) {
      contact.details.forEach((d) => {
        displayData.push(`When: ${format(d.date, 'dd/MM')}`);
        displayData.push(`Duration: ${d.duration}`);
        displayData.push(`Attentuation: ${d.attenuationValue}`);
        displayData.push(`Risk Score: ${d.totalRiskScore}`);
        displayData.push(`Attentuation Durations: ${d.attenuationDurations}`);
      });
    }
    Alert.alert('Exposure Details', displayData.join('\n'), [
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed'),
        style: 'cancel'
      }
    ]);
  };

  const listContactInfo = (contact: Object) => {
    const aDay = 24 * 60 * 60 * 1000;

    const contactDate =
      contact.exposureAlertDate - contact.daysSinceLastExposure * aDay;
    return `When: ${format(
      contact.exposureAlertDate,
      'dd/MM HH:mm'
    )}, Last: ${format(contactDate, 'dd/MM')}, Score: ${
      contact.maxRiskScore
    }, Keys: ${contact.matchedKeyCount} ${contact.details ? ', *' : ''}`;
  };

  return (
    <Scrollable heading="Debug">
      <Button type="major" onPress={checkExposure}>
        Check Exposure
      </Button>
      <Button type="major" onPress={simulateExposure}>
        Simulate Exposure
      </Button>
      <Button type="major" onPress={deleteAllData}>
        Delete All Data
      </Button>
      {logData && (
        <View style={styles.logScroll}>
          <ScrollView style={styles.contactsScroll}>
            {logData.installedPlayServicesVersion > 0 && (
              <Text>
                Play Services Version: {logData.installedPlayServicesVersion}
              </Text>
            )}
            {logData.nearbyApiSupported === true ||
              (logData.nearbyApiSupported === false && (
                <Text>
                  Exposure API Supported: {`${logData.nearbyApiSupported}`}
                </Text>
              ))}
            {<Text>Last Index: {logData.lastIndex}</Text>}
            {<Text>Last Ran: {logData.lastRun}</Text>}
            {Boolean(logData.lastError && logData.lastError.length) && (
              <Text selectable={true}>
                Last Message: {`${logData.lastError}`}
              </Text>
            )}
            {Boolean(logData.lastApiError && logData.lastApiError.length) && (
              <Text selectable={true}>
                Last Exposure API Error: {`${logData.lastApiError}`}
              </Text>
            )}
          </ScrollView>
        </View>
      )}
      <View style={styles.contacts}>
        <Text style={styles.title}>Contacts</Text>
      </View>
      <ScrollView style={styles.contactsScroll}>
        {contacts &&
          contacts.map((c, index) => (
            <Text
              key={index}
              style={styles.row}
              onPress={() => displayContact(c)}>
              {listContactInfo(c)}
            </Text>
          ))}
      </ScrollView>
      <View style={styles.contacts}>
        <Text selectable={true} style={styles.title}>
          Logs
        </Text>
      </View>
      <ScrollView>
        <Text selectable={true}>{JSON.stringify(events, null, 2)}</Text>
      </ScrollView>
    </Scrollable>
  );
};

const styles = StyleSheet.create({
  stats: {
    marginTop: 24,
    paddingTop: 8,
    borderTopWidth: 1
  },
  contacts: {
    marginTop: 12,
    borderTopWidth: 1
  },
  logScroll: {
    height: 100
  },
  contactsScroll: {
    height: 200
  },
  title: {
    fontSize: 24,
    marginBottom: 12
  },
  row: {
    height: 28
  }
});
