import React from 'react';
import { View, Text, Modal, Alert, StyleSheet, TouchableOpacity, LogBox, ToastAndroid } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import KeepAwake from 'react-native-keep-awake';
const IModal = ({ percentage, savedRecord, totalRecords, modalVisible, onCancel }) => {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    LogBox.ignoreLogs(['componentWillReceiveProps']);
    KeepAwake.activate();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => { ToastAndroid.show("Please wait while downloading is completed.Thanks!", ToastAndroid.SHORT) }}
        >
            <View style={styles.centeredView} >
                <View style={styles.modalView}>
                    <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name={'download'} color={'#1fcc0c'} size={30} style={{ flex: 0.25 }} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1.6,color:'#000000' }}>Downloading </Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 17, textAlign: 'left', marginBottom: 20 }}>Please wait.It will take some time to download. </Text>
                        <ProgressBarAnimated
                            width={270}
                            height={6}
                            barEasing="linear"
                            value={parseInt(percentage)}
                            maxValue={100}
                            backgroundColorOnComplete="#6CC"
                            backgroundColor="#6CC644"
                            underlyingColor="#ccc"
                            borderColor="#1fcc0c"
                            borderRadius={2}
                            onComplete={onCancel}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 10 }}>
                        <Text style={{ textAlign: 'left', flex: 1 }}>{percentage}%</Text>
                        <Text style={{ textAlign: 'right', flex: 1 }}>{savedRecord}/{totalRecords}</Text>
                    </View>
                    {/* <TouchableOpacity style={{ width: 270, marginVertical: 10 }} onPress={onCancel}>
                        <Text style={{ color: '#1fcc0c', fontWeight: '700', fontSize: 18, textAlign: 'right' }}>Cancel</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    // button: {
    //   borderRadius: 20,
    //   padding: 10,
    //   elevation: 2
    // },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
})

export default IModal;

