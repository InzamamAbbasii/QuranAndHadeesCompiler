import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import CircularProgress from 'react-native-circular-progress-indicator';
var RNFS = require('react-native-fs');
export default function Hadees({ navigation, route }) {
    const [data, setData] = useState([]);
    const [isFetched, setisFetched] = useState(true);
    const [percentage, setPercentage] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [savedData, setSavedData] = useState(0);

    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const ReadHadees = async () => {
        console.log('read Hadees...');
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='Hadees'",
                [],
                function (tx, res) {
                    console.log('item:', res.rows.length);
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS Hadees', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS Hadees(Id INTEGER PRIMARY KEY AUTOINCREMENT, JildNo INT, HadeesNo INT, NarratedBy TEXT,HadeesText TEXT)',
                            []
                        );
                        // TODO;read data from file and store into database
                        RNFS.readFileAssets('BUKHARI.TXT', 'ascii').then((res) => {
                            console.log('..................................');
                            var cleanStr = res.replace(/-/g, "");//replace every "-" with blank ""
                            let newFile = cleanStr.split('\n');
                            let startingIndex = 0;
                            for (let index = 0; index < newFile.length; index++) {
                                const element = newFile[index];
                                if (element.match('1')) {
                                    startingIndex = index;
                                    break;
                                }
                            }
                            let hadeesData = [];
                            // console.log('staring index..',startingIndex);
                            for (let index = startingIndex; index < newFile.length; index++) {
                                const element = newFile[index];
                                // console.log(element);
                                if (newFile[index].length > 1) {//TODO:Check if line has no  string
                                    if (element.match(/^\d.[\s]*\d/)) { // \d means digit and \s means space
                                        // Return true if new line start with any numeric value
                                        hadeesData.push(element);
                                    } else {
                                        let i = hadeesData.length - 1;
                                        let newText = JSON.stringify(element);
                                        let oldText = JSON.stringify(hadeesData[i]);
                                        let str = '';
                                        str = oldText.concat(' ', newText);
                                        let finalStr = str.replace(/\\r|"|\\/g, '');
                                        hadeesData.pop();
                                        hadeesData.push(finalStr);
                                    }
                                }
                            }

                            let hadeesWords = [];
                            for (let i = 0; i < hadeesData.length; i++) {
                                let ele = hadeesData[i];
                                let [first, second, ...third] = ele.split(':');
                                let [jild, hadees] = first.split('.');
                                let obj = {};
                                obj.JildNo = jild;
                                obj.HadeesNo = hadees;
                                obj.NarratedBy = second;
                                //obj.HadeesText = third[0];
                                third.forEach((element, index) => {
                                    if (index == 0) {
                                        obj.HadeesText = element;
                                    } else {
                                        obj.HadeesText += ':' + element;
                                    }
                                });
                                hadeesWords.push(obj);
                            }

                            hadeesWords.forEach((element, index) => {
                                // console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');
                                // console.log(element);
                                // console.log(element.JildNo, element.HadeesNo, element.NarratedBy,element.HadeesText);
                                // TODO:Store file data to database
                                db.transaction(function (tx) {
                                    tx.executeSql(
                                        'INSERT INTO Hadees (JildNo, HadeesNo, NarratedBy,HadeesText) VALUES (?,?,?,?)',
                                        [element.JildNo, element.HadeesNo, element.NarratedBy, element.HadeesText],
                                        (tx, results) => {
                                            if (results.rowsAffected > 0) {
                                                let per = ((results.insertId / hadeesWords.length) * 100).toFixed(0);
                                                setPercentage(per);
                                                console.log(`${per}% Data Stored Successfully! , Inserted ID : ${results.insertId}`);
                                            } else alert('Something went worng...');
                                        }
                                    );
                                });
                                // ............END OF STORING DATA TO DATABASE.............
                            });
                            //   navigation.navigate('Hadees');
                            getHadeesData();
                            console.log('.........................END...........................');
                        });
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going to next screen..');
                        // navigation.navigate('Hadees');
                        getHadeesData();
                    }
                }
            );
        });
    }
    const getHadeesData = async () => {
        console.log('get hadees data...');
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'select * from Hadees WHERE JildNo=? AND HadeesText is not NULL',
                [route.params.JildNo],
                (tx, results) => {
                    var temp = [];
                    console.log('line 120 ', results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                    }
                    temp.forEach(element => {
                        setData(data => [...data,
                        {
                            Id: element.Id,
                            JildNo: element.JildNo,
                            HadeesNo: element.HadeesNo,
                            NarratedBy: element.NarratedBy,
                            HadeesText: element.HadeesText,
                        }
                        ]);
                    });
                    setisFetched(false);
                });
        })
    }
    useEffect(async () => {
        // await ReadHadees();
        getHadeesData();
    }, []);
    return (
        <View style={{
            padding: 10, flex: 1, backgroundColor: '#fff'
        }}>

            {
                isFetched == true ? (
                    percentage == 0 ? (
                        <View style={[styles.container, styles.horizontal]}>
                            <ActivityIndicator size="large" color="red" />
                            {/* <Progress.Bar progress={0.3} width={200} height={10} /> */}
                        </View>
                    ) : (
                        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
    
                            <CircularProgress
                                value={percentage}
                                radius={120}
                                duration={2000}
                                textColor={'red'}
                                maxValue={100}
                                title={'%'}
                                titleColor={'red'}
                                titleStyle={{ fontWeight: 'bold' }}
                            />
                        </View>
                    )
                ) : (
                    <FlatList showsVerticalScrollIndicator={false}
                        data={data}
                        keyExtractor={(item, index) => index}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        renderItem={(item, index) =>
                            <View
                                style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 10, padding: 10, backgroundColor: '#58c7be' }}>
                                <Text style={{ color: '#000', fontWeight: 'bold', paddingVertical: 10, fontSize: 20 }} >Jild No {item.item.JildNo} : Hadees No {item.item.HadeesNo}</Text>
                                <Text style={{ fontSize: 20,color:'#222' }}>{item.item.NarratedBy}</Text>
                                <Text style={{ fontSize: 20,color:'#222' }}>{item.item.HadeesText}</Text>
                            </View>
                        }
                    />
                )
            }
        </View>
    );
}
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
})