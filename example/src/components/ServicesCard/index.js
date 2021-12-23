import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import base64 from 'react-native-base64'

export const ServicesCard = ({ servicesAndcharacteristics }) => {
  return (
    <View>
      {servicesAndcharacteristics.map((item, index) => {
        delete item._manager
        return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>Service {index}</Text>
            <Text style={styles.deviceParam}>
              {`deviceID: ${'\n'}`}
              <Text style={styles.deviceParamValue}>{item.deviceID}</Text>
            </Text>
            <Text style={styles.deviceParam}>
              {`id: `}
              <Text style={styles.deviceParamValue}>{item.id}</Text>
            </Text>
            <Text style={styles.deviceParam}>
              {`isPrimary: `}
              <Text style={styles.deviceParamValue}>{item.isPrimary.toString()}</Text>
            </Text>
            <Text style={styles.deviceParam}>
              {`UUID: `}
              <Text style={styles.deviceParamValue}>{item.uuid}</Text>
            </Text>
            {item.characteristics.map((characteristic, _index) => {
              delete characteristic._manager
              const data = []
              data.push(
                <Text key={characteristic.id} style={[styles.subtitle, { marginTop: 20 }]}>
                  Characteristic {_index}
                </Text>,
              )
              for (const i in characteristic) {
                data.push(
                  <Text style={styles.deviceParam}>
                    {`${i}: `}
                    <Text style={styles.deviceParamValue}>
                      {i === 'value'
                        ? characteristic[i] === null
                          ? 'null'
                          : base64.decode(characteristic[i])
                        : `${characteristic[i]}`}
                    </Text>
                  </Text>,
                )
              }
              return data
            })}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  deviceParam: {
    fontWeight: '500',
  },
  deviceParamValue: {
    fontWeight: 'normal',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  serviceContainer: {
    marginBottom: 10,
  },
})
