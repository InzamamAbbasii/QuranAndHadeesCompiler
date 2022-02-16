import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, LogBox, Alert, Modal, TextInput } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const AllWords = ({ navigation, route }) => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [word, setWord] = useState('');
    const [id, setId] = useState('');
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });

    const getAllWords = () => {
        console.log('get Keyword');
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * from KeyWords',

                [],
                (tx, results) => {
                    var temp = [];
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                        console.log(temp);
                        temp.forEach(element => {
                            setData(data => [...data, { KID: element.KID, Word: element.Word }]);
                        });
                    } else {
                        alert('No Record Found')
                    }
                    setIsFetched(false);
                });
        });
    }
    useEffect(() => {
        getAllWords();



    }, []);
    const Delete = (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE from Synonyms WHERE KID=?',
                [id],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        db.transaction((tx) => {
                            tx.executeSql(
                                'DELETE from KeyWords WHERE KID=?',
                                [id],
                                (tx, results) => {
                                    console.log('Results', results.rowsAffected);
                                    if (results.rowsAffected > 0) {
                                        Alert.alert(
                                            'Done',
                                            'Record Deleted Successfully',
                                            [
                                                {
                                                    text: 'Ok',
                                                    onPress: () => getAllWords(),
                                                },
                                            ],
                                            { cancelable: false }
                                        );
                                    }
                                }
                            );
                        });
                    }
                }
            );
        });
    }

    const updateWord = async() => {
        if (word.length == 0) {
            alert('Please Fill Required Fileds')
        } else {
            console.log(id, word);
            await db.transaction(function (txn) {
                txn.executeSql(
                    'UPDATE Keywords SET Word=? WHERE KID=?',
                    [word, id],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                            Alert.alert(
                                'Done',
                                'Record Updated Successfully',
                                [
                                    {
                                        text: 'Ok',
                                        onPress: () =>{ getAllWords();setModalVisible(false)}
                                    },
                                ],
                                { cancelable: false }
                            );
                        } else alert('Somethinf went wrong');
                    }
                );
            });//end db

        }
    }
    return (
        <View style={styles.container}>
            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <View style={[styles.button, { flexDirection: 'row' }]}>
                            <TouchableOpacity onPress={() => navigation.navigate('AllSynonyms', { KID: item.item.KID })}
                                style={{ height: 50, flex: 1 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {/* <Text style={[styles.buttonText,{textAlign:'left'}]} >KID {item.item.KID}</Text> */}
                                    <Text style={[styles.buttonText, { textAlign: 'left' }]} >{item.item.Word}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setModalVisible(true); setWord(item.item.Word); setId(item.item.KID) }}
                                style={{ height: 50, marginLeft: 10, borderRadius: 10, justifyContent: 'center' }}>
                                <Icon name="square-edit-outline" size={30} color="#900" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Delete(item.item.KID)}
                                style={{ height: 50, marginLeft: 15, borderRadius: 10, justifyContent: 'center' }}>
                                <Icon name="delete" size={30} color="#900" />
                            </TouchableOpacity>


                        </View>
                    }
                />
            )
            }

            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 40 }}> Update </Text>
                            <TextInput style={{ borderWidth: 1, height: 50, width: '90%', backgroundColor: 'pink', color: '#000', marginBottom: 10 }}
                                value={word}
                                onChangeText={(text) => setWord(text)}
                            />
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end', marginTop: 40 }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'blue', height: 40, marginRight: 10, width: 70, justifyContent: 'center', borderRadius: 8 }}
                                    onPress={() => updateWord()}
                                >
                                    <Text style={{ fontSize: 18, textAlign: 'center', color: '#fff' }}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'blue', height: 40, width: 70, justifyContent: 'center', borderRadius: 8 }}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={{ fontSize: 18, textAlign: 'center', color: '#fff' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

export default AllWords;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    button: {
        flex: 1,
        width: '97%',
        backgroundColor: '#58c7be',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 8,
        elevation: 5,
        marginBottom: 10,
        padding: 10
    },
    buttonText: {
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        padding: 10,
        fontSize: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        width: '90%',
        minHeight: '40%',
        justifyContent: 'center',
        backgroundColor: "white",
        borderRadius: 20,
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
    }
})
