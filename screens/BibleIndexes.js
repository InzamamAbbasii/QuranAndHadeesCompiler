import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import { openDatabase } from 'react-native-sqlite-storage';
import KeepAwake from 'react-native-keep-awake';
import IModal from '../src/components/IModal';
import CongratsAlert from '../src/components/CongratsAlert';
export default BibleIndexes = ({ navigation }) => {
    const [isStore, setIsStore] = useState(true);
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showCongratsAlert, setShowCongratsAlert] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [savedData, setSavedData] = useState(0);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const handleCancel = () => {
        setPercentage(0);
        setSavedData(0);
        setTotalData(0);
        setModalVisible(false);//to hide Downloader alert-(IModel)
        setShowCongratsAlert(true);//to show CongratsAlert
        KeepAwake.deactivate();
    }
    const handleOk = () => {
        setPercentage(0);
        setSavedData(0);
        setTotalData(0);
        setShowCongratsAlert(false);//to hide CongratsAlert
    }
    useEffect(async () => {
        const unsubscribe = navigation.addListener('focus', async () => {
            // The screen is focused
            // Call any action
            await storeBibleKeyWords();
            console.log('Bible Screen is focused');
        });
        await getBibleKeyWords();
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, []);

    const storeBibleKeyWords = async () => {
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='BibleKeywords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        setModalVisible(true);
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS BibleKeywords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS BibleKeywords(Id INTEGER PRIMARY KEY AUTOINCREMENT,ChapterNo INT,VerseNo INT,BookId INT,Keywords TEXT,BookName TEXT)',
                            []
                        );
                        db.transaction((tx) => {
                            tx.executeSql(
                                'SELECT * FROM Bible1',
                                [],
                                (tx, results) => {
                                    var temp = [];
                                    // console.log(results.rows.length);
                                    var len = results.rows.length;
                                    if (len > 0) {
                                        for (let i = 0; i < len; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    let data = []; let finalArray = [];
                                    RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                                        var newData = res.split(/\r?\n/);
                                        temp.forEach((element, i) => {
                                            var e = JSON.stringify(element.VerseText);
                                            var originalStr = "" + JSON.parse(e);
                                            var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
                                            var removeExtraSymbols = removeSpaces.replace(/[^a-zA-Z ]/g, "");
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
                                            var uniqueWords = [...new Set(newStringArray1)];
                                          
                                            uniqueWords.forEach((keyword) => {
                                                let obj = {};
                                                   obj.Id = element.Id,
                                                    obj.ChapterNo = element.ChapterNo,
                                                    obj.VerseNo = element.VerseNo,
                                                    obj.BookId = element.BookId,
                                                    obj.Keyword = keyword,
                                                    finalArray.push(obj);
                                            });

                                        });//temp end
                                        finalArray.forEach((element,i) => {
                                            db.transaction(function (tx) {
                                                tx.executeSql(
                                                    'INSERT INTO BibleKeywords (ChapterNo,VerseNo,BookId,Keywords,BookName) VALUES (?,?,?,?,?)',
                                                    [element.ChapterNo, element.VerseNo, element.BookId, element.Keyword, 'Bible'],
                                                    (tx, results) => {
                                                        if (results.rowsAffected > 0) {
                                                            console.log(element.ChapterNo,element.VerseNo,element.BookId,element.Keyword);
                                                            let per = (((i + 1) / finalArray.length) * 100).toFixed(0);
                                                            setPercentage(per);
                                                            setTotalData(finalArray.length); setSavedData((i + 1));
                                                            console.log('Inserted Id ', results.insertId, per);
                                                        } else alert('Something went worng...');
                                                    }
                                                );
                                            });
                                        });
                                    });
                                });//read file end
                        });
                        //         // ------------------------------------------------
                        console.log('........................END Storing Bible KeyWords...................');
                    } else {
                        console.log('Do nothing in Bible Screen..');
                        //   navigation.navigate('Quran');
                        // storeHadeesKeyWords();
                        setIsStore(false);
                    }
                }
            );
        });


    }
    const getBibleKeyWords = async () => {
        setData([]);
        setIsFetched(true);
        //read keywords from Quran_KeyWords
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM BibleKeywords",
                [],
                function (tx, res) {
                    var temp = [];
                    var len = res.rows.length;
                    console.log(len);
                    if (len > 0) {
                        for (let i = 0; i < 10; ++i)
                            temp.push(res.rows.item(i));
                        temp.forEach(element => {
                            setData(data => [...data,
                            {
                                Id: element.Id,
                                ChapterNo: element.ChapterNo,
                                VerseNo: element.VerseNo,
                                BookId: element.BookId,
                                Keyword: element.Keywords,
                            }
                            ]);
                        });
                    }
                    setIsFetched(false);
                });
        });
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <KeepAwake />
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
            {
                isFetched == true ? (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="red" />
                    </View>
                ) : (
                    <View style={{ width: '100%', height: '100%', padding: 15, backgroundColor: '#58c7be' }}>
                        <FlatList showsVerticalScrollIndicator={false}
                            data={data}
                            keyExtractor={(item, index) => index}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            ListHeaderComponent={<Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Indexes</Text>}
                            renderItem={(item, index) =>
                                <View>
                                    {/* <Text style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#58c7be', paddingVertical: 10, fontSize: 20 }} >Chapter No {item.item.ChapterNo} Verse No {item.item.VerseNo} : BookId {item.item.BookId}</Text> */}
                                    <Text style={{ fontSize: 20, color: '#222' }}>{item.item.Keyword}({item.item.ChapterNo},{item.item.VerseNo})</Text>
                                </View>
                            }
                        />
                    </View>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
});