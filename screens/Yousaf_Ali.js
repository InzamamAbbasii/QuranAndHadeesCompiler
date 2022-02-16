import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, LogBox } from 'react-native';
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import CircularProgress from 'react-native-circular-progress-indicator';
import { openDatabase } from 'react-native-sqlite-storage';
import * as Progress from 'react-native-progress';
import { log } from "react-native-reanimated";
import IModal from "../src/components/IModal";
import CongratsAlert from "../src/components/CongratsAlert";
import KeepAwake from "react-native-keep-awake";
const Yousaf_Ali = ({ navigation, route }) => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    const [percentage, setPercentage] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [savedData, setSavedData] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [showCongratsAlert, setShowCongratsAlert] = useState(false);
    const [numOfIteration, setNumOfIteration] = useState(0);
    const [loading, setLoading] = useState(true);

    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const storeYousaf_AliKeyWords = async () => {
        await db.transaction(function (txn) {
            txn.executeSql(
                "Select * from Yousaf_Ali",
                [],
                function (tx, res) {
                    var temp = [];
                    var len = res.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(res.rows.item(i));
                        if (res.rows.item(len - 1).Keywords == undefined) {
                            txn.executeSql("Alter table Yousal_Ali Add Column Keywords TEXT", [])
                            setModalVisible(true);
                            RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                                var newData = res.split(/\r?\n/);
                                temp.forEach((element, i) => {
                                    var e = JSON.stringify(element.AyatText);
                                    var originalStr = "" + JSON.parse(e);
                                    var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
                                    var removeExtraSymbols = removeSpaces.replace(/,|;|:|\?|\.|([()])/g, '');
                                    var wordsArray = removeExtraSymbols.split(' ');
                                    let newStringArray1 = sw.removeStopwords(wordsArray);

                                    newStringArray1.forEach((word, index) => {
                                        if (word.length == 0) {
                                            newStringArray1.splice(index, 1)//remove empty element("") from array
                                            index--;
                                        } else {
                                            newData.forEach(stopWord => {
                                                if (word.toLocaleLowerCase() == stopWord.toLocaleLowerCase()) {
                                                    //   console.log(index,wordsArray[index]);
                                                    newStringArray1.splice(index, 1)//remove matching word
                                                    index--;
                                                }
                                            });
                                        }
                                    });
                                    let uniqueValues = [...new Set(newStringArray1)].join(',');
                                    db.transaction((tx) => {
                                        tx.executeSql(
                                            'UPDATE Yousaf_Ali set Keywords=? where Id=?',
                                            [uniqueValues, element.Id],
                                            (tx, results) => {
                                                if (results.rowsAffected > 0) {
                                                    let per = (((element.Id / temp.length) * 100)).toFixed(0);
                                                    setPercentage(per);
                                                    setTotalData(temp.length); setSavedData(element.Id);
                                                    console.log(`Row ${element.Id} Updated Successfully...,  Percentage : ${per}`)
                                                } else alert('Error');
                                            }
                                        );
                                    });
                                });//temp end
                            });//read file end
                            console.log('........................END...................');
                        } else {
                            console.log('Do nothing going to next screen..');
                            //   navigation.navigate('Quran');
                            // storeHadeesKeyWords();
                            // setIsStore(false);
                        }
                    }
                }
            );
        });
    }
    const getYousaf_AliData = async () => {
        // await ReadYousaf_Ali();
        console.log('get Yousaf_Ali Data');
        setData('');
        await db.transaction((tx) => {
            tx.executeSql(
                'SELECT * from Yousaf_Ali WHERE ChapterNo=?',
                [route.params.ChapterNo],
                (tx, results) => {
                    var temp = [];
                    // console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                    }
                    temp.forEach(element => {
                        setData(data => [...data,
                        {
                            Id: element.Id,
                            SurahId: element.SurahId,
                            AyatId: element.AyatId,
                            AyatText: element.AyatText,
                        }
                        ]);
                    });
                    setIsFetched(false);
                });
        });
    }
    // ...........................................
    const handleOk = () => {
        setPercentage(0);
        setSavedData(0);
        setTotalData(0);
        setShowCongratsAlert(false);//to hide CongratsAlert
    }
    const handleCancel = () => {
        setPercentage(0);
        setSavedData(0);
        setTotalData(0);
        setModalVisible(false);//to hide Downloader alert-(IModel)
        setShowCongratsAlert(true);//to show CongratsAlert
        KeepAwake.deactivate();
    }
    // ........................................
    useEffect(async () => {
        setIsFetched(true);
        // storeYousaf_AliKeyWords();
        getYousaf_AliData();
    }, []);
    return (

        <View style={styles.container}>
            <IModal
                percentage={percentage}
                savedRecord={savedData}
                totalRecords={totalData}
                modalVisible={modalVisible}
                onCancel={handleCancel}
            />

            <CongratsAlert
                modalVisible={showCongratsAlert}
                onOk={handleOk}
            />

            <KeepAwake />

            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="red" />
                    {/* <Progress.Bar progress={0.3} width={200} height={10} /> */}
                </View>
            ):(
                <FlatList showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <View
                            style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 10, padding: 10, backgroundColor: '#58c7be' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#58c7be', paddingVertical: 10, fontSize: 20 }} >Surah No {item.item.SurahId} : Ayat No {item.item.AyatId}</Text>
                            <Text style={{ fontSize: 20, color: '#222' }}>{item.item.AyatText}</Text>
                        </View>
                    }
                />
            )
            }
        </View>
    );
}

export default Yousaf_Ali;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    button: {
        backgroundColor: '#58c7be',
        marginBottom: 13,
        height: 50,
        width: '97%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 30
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
})
