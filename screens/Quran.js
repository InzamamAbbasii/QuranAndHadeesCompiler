import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import { openDatabase } from 'react-native-sqlite-storage';
const Quran = ({ navigation, route }) => {
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const ReadQuran = async () => {
        console.log('read Quran');
       await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='Quran'",
                [],
                function (tx, res) {
                    console.log('item:', res.rows.length);
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS Quran', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS Quran(Id INTEGER PRIMARY KEY AUTOINCREMENT, SurahId INT, AyatId INT, AyatText TEXT)',
                            []
                        );
                        // TODO;read data from file and store into database
                        RNFS.readFileAssets('PICKTHAL.TXT', 'ascii').then((res) => {
                            console.log('..................................');
                            let newFile = res.split('\n');
                            let startingIndex = 0;
                            for (let index = 0; index < newFile.length; index++) {
                                const element = newFile[index];
                                if (element.match('001')) {
                                    startingIndex = index;
                                    break;
                                }
                            }
                            let data = [];
                            for (let index = startingIndex; index < newFile.length; index++) {
                                const element = newFile[index];
                                if (newFile[index].length > 1) {
                                    if (element.match(/^\d/)) {
                                        // Return true
                                        data.push(element);
                                    } else {
                                        let i = data.length - 1;
                                        let newText = JSON.stringify(element);
                                        let oldText = JSON.stringify(data[i]);
                                        let str = '';
                                        str = oldText.concat(' ', newText);
                                        let finalStr = str.replace(/\\r|"/g, '');
                                        data.pop();
                                        data.push(finalStr);
                                    }
                                }
                            }
                            let words = [];
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                let newElement = ele.split(' ');
                                let [first, ...second] = ele.split(" ");
                                let [surah, ayat] = first.split('.');
                                second = second.join(" ")
                                let obj = {};
                                obj.SurahId = surah;
                                obj.AyatId = ayat;
                                obj.AyatText = JSON.stringify(second);
                                words.push(obj);
                            }
                            words.forEach((element, index) => {
                                // console.log(element.SurahId, element.AyatId, JSON.parse(element.AyatText));
                                // TODO:Store file data to database
                                db.transaction(function (tx) {
                                    tx.executeSql(
                                        'INSERT INTO Quran (SurahId, AyatId, AyatText) VALUES (?,?,?)',
                                        [element.SurahId, element.AyatId, JSON.parse(element.AyatText)],
                                        (tx, results) => {
                                            console.log('Inserted Id ', results.insertId);
                                            if (results.rowsAffected > 0) {
                                                console.log('Data Stored Successfully!');
                                            } else alert('Something went worng...');
                                        }
                                    );
                                });
                                // ............END OF STORING DATA TO DATABASE.............
                            });
                            //   navigation.navigate('Quran');
                            getQuranData();
                        });
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going to next screen..');
                        // navigation.navigate('Quran');
                        getQuranData();
                    }
                }
            );
        });

    }

    const getQuranData = async () => {
        // await ReadQuran();
        console.log('get Quran Data');
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Quran',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
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

    useEffect(async () => {
        setIsFetched(true);
       await ReadQuran();
    }, []);


    return (

        <View style={styles.container}>
            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <View
                            style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 20, padding: 10, backgroundColor: '#fff' }}>
                            <Text style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10,fontSize:20 }} >Surah No {item.item.SurahId} : Ayat No {item.item.AyatId}</Text>
                            <Text style={{ fontSize: 20, }}>{item.item.AyatText}</Text>
                        </View>
                    }
                />
            )
            }
        </View>
    );
}

export default Quran;
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
        backgroundColor: '#3a53a6',
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
