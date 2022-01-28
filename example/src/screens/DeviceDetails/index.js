import React, { useContext, useState, useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View, Text } from 'react-native'

import { useNavigation, useRoute } from '@react-navigation/native'
import base64 from 'react-native-base64'

import { BLEmanager } from '../../../index'
import { showToast } from '../../utils/showToast'
import { DevicesContext } from '../../contexts/DevicesContext'
import { LoadingIndicator, DeviceDetailsCard, ServicesCard, PrimaryButton } from '../../components'
import { COLORS } from '../../contants/colors'

export const DeviceDetailsScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [servicesAndcharacteristics, setServicesAndcharacteristics] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [characteristicValue, setCharacteristicValue] = useState('')
  const [characteristicData, setCharacteristicData] = useState({})

  const navigation = useNavigation()
  const route = useRoute()

  const [devices, setDevices] = useContext(DevicesContext)
  const device = route?.params?.device || {}

  useEffect(() => {
    navigation.setOptions({
      headerTitle: device.name || device.localName || 'No name',
      headerStyle: { backgroundColor: COLORS.BACKGROUND_GRAY },
    })
    handleDeviceServices(device.id)
  }, [device])

  const handleCancelConnection = async deviceId => {
    handleStartLoading()
    try {
      const disconnectedDevice = await BLEmanager.cancelDeviceConnection(deviceId)
      console.log('Connection cancelled succesfully: ', disconnectedDevice)
      showToast('success', 'Disconnected from device')

      handleConnectionStatus(disconnectedDevice, false)
    } catch (error) {
      showToast('error', error.message, error.name)
      console.log('Error! Connection cancellation: ', error)
    } finally {
      handleStopLoading()
      navigation.goBack()
    }
  }

  const handleDeviceServices = async deviceId => {
    handleStartLoading()
    try {
      const deviceServices = await BLEmanager.servicesForDevice(deviceId)
      handleDeviceCharacteristics(deviceServices)
      console.log('Device services: ', deviceServices)
    } catch (error) {
      showToast('error', error.message, error.name)
      console.log('Error while getting device services! ', error)
    } finally {
      handleStopLoading()
    }
  }

  const handleDeviceCharacteristics = async deviceServices => {
    const deviceServicesAndCharacteristics = []
    handleStartLoading()
    for (const service of deviceServices) {
      try {
        const serviceCharacteristics = await BLEmanager.characteristicsForDevice(
          device.id,
          service.uuid,
        )
        deviceServicesAndCharacteristics.push({
          ...service,
          characteristics: serviceCharacteristics,
        })
      } catch (error) {
        showToast('error', error.message, error.name)
        console.log('Error while getting device characteristics! ', error)
      }
    }
    setServicesAndcharacteristics(deviceServicesAndCharacteristics)
    console.log('Device Services & Characteristics: ', deviceServicesAndCharacteristics)
    handleStopLoading()
  }

  const handleConnectionStatus = (handledDevice, isConnected) => {
    const deviceIndex = devices.findIndex(device => device.id === handledDevice.id)
    const devicesArr = JSON.parse(JSON.stringify(devices))
    devicesArr[deviceIndex] = { ...devicesArr[deviceIndex], isConnected }
    setDevices(devicesArr)
  }

  const handleWriteCharacteristic = async () => {
    handleStartLoading()
    const base64Value = base64.encode(characteristicValue)

    try {
      const response = await BLEmanager.writeCharacteristicWithResponseForDevice(
        characteristicData.deviceId,
        characteristicData.serviceUUID,
        characteristicData.characteristicUUID,
        base64Value,
      )
      console.log('Write characteristic: ', response)
    } catch (error) {
      showToast('error', 'Error writing characteristic!', error.name)
      console.log('Error while writing characteristic! ', error)
    } finally {
      handleStopLoading()
      setModalVisible(false)
      setCharacteristicValue('')
    }
  }

  const handleCloseModal = () => {
    setCharacteristicValue('')
    setModalVisible(false)
  }

  const handleStartLoading = () => setIsLoading(true)
  const handleStopLoading = () => setIsLoading(false)
  const handleOpenModal = () => setModalVisible(true)

  return (
    <ScrollView indicatorStyle="black" contentContainerStyle={styles.contentContainer}>
      <DeviceDetailsCard deviceDetails={device} />
      <ServicesCard
        onHandleOpenModal={handleOpenModal}
        onSetCharacteristicData={setCharacteristicData}
        servicesAndcharacteristics={servicesAndcharacteristics}
      />
      <LoadingIndicator isLoading={isLoading} />
      <View style={styles.buttonContainer}>
        <PrimaryButton
          onPress={() => handleCancelConnection(device.id)}
          title="Disconnect device"
        />
      </View>
      <Modal transparent={true} visible={modalVisible}>
        <Pressable onPress={handleCloseModal} style={styles.modalBackdrop}>
          <View style={styles.modalWrapper}>
            <Text style={styles.modalTitle}>Write characteristic: </Text>
            <TextInput
              value={characteristicValue}
              placeholder="Value..."
              style={styles.input}
              placeholderTextColor={COLORS.GRAY}
              textAlignVertical="top"
              maxLength={150}
              onChangeText={value => setCharacteristicValue(value)}
            />
            <Pressable style={styles.modalButton} onPress={handleWriteCharacteristic}>
              <Text style={styles.modalButtonText}>Write</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    marginBottom: 10,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    marginTop: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
    backgroundColor: COLORS.BLUE,
  },
  modalButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: COLORS.WHITE,
  },
  modalWrapper: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '30%',
    width: '80%',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: COLORS.SECONDARY_GRAY,
    borderRadius: 10,
    padding: 20,
  },
})
