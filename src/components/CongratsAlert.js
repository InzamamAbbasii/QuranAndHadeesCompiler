import React, { useState, useEffect } from 'react';
import { View, Text, Modal,StyleSheet, TouchableOpacity } from "react-native";
import LottieView from 'lottie-react-native';
const CongratsAlert = ({modalVisible, onOk }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView} >
                <View style={styles.modalView}>
                <Text style={{fontSize:30,fontWeight:'bold',color:'#01ab87'}}> Congratulations!</Text>

                    <LottieView source={require('../assests/72701-completed-animation.json')}
                        autoPlay
                        loop={false}
                        resizeMode='cover'
                        style={{ height: 130,marginTop:10,marginBottom:40}} 
                        />
                    <Text style={{fontSize:20,fontWeight:'bold',color:'#666666'}}> Successfully Downloaded.</Text>
                    <TouchableOpacity style={{ width: 150,height:50,backgroundColor:'#01ab87',justifyContent:'center' ,marginTop: 20,borderRadius:10 }} onPress={onOk}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20, textAlign: 'center' }}> OK </Text>
                    </TouchableOpacity>
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
        backgroundColor: "#fff",
        padding: 25,
        width:'88%',
        borderRadius:10,
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

export default CongratsAlert;

