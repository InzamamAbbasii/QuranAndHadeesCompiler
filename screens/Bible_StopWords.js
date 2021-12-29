import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
var RNFS = require('react-native-fs');
const removeSuffix = require('remove-suffix')
const sw = require('remove-stopwords');
var pluralize = require('pluralize');
// var singular = require('pluralize-me');
import { singular, plural } from 'pluralize-me';
const Bible_StopWords = ({ navigation }) => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const [quranData, setQuranData] = useState([]);
    const [data, setData] = useState([]);
    const [a1, setA1] = useState([]);
    let listOfStopWords = [];
    const suffixArray = ['-ee', 'eer', 'er', 'ion', 'ism', 'ity', 'ment', 'ness', 'tion', 'sion', 'ship', 'th', 'able',
        'al', 'ant', 'ary', 'ful', 'ic', 'ious', 'ive', 'less', 'y', 'ed', 'en', 'er', 'ing', 'ize', 'ise',
        'ly', 'ward', 'wise', 'ac', 'ways', 'ical', 'ence', 'ery', 'ess', 'hoop', 'ist', 'ship', 'or', 'ate', 'ify', 'ing'];
    const readStopWords = async () => {
        RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
            var data = res.split(/\r?\n/);
            data.forEach(element => {
                listOfStopWords.push(element);
                setData(data => [...data, {
                    element
                }])
            });
        });
    }
    useEffect(async () => {
        setData('');
        console.log('useEffect.....');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Bible1',
                [],
                (tx, results) => {
                    var temp = [];
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < 20; ++i)
                            temp.push(results.rows.item(i));
                    }
                    let data = []; let finalArray=[];
                    RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                        var newData = res.split(/\r?\n/);
                        temp.forEach((element, i) => {
                            var e = JSON.stringify(element.VerseText);
                            var originalStr = "" + JSON.parse(e);
                            var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
                            var removeExtraSymbols = removeSpaces.replace(/,|;|:|\?|\.|([()])/g, '');
                            var wordsArray = removeExtraSymbols.split(' ');
                            let newStringArray1 = sw.removeStopwords(wordsArray);
                            newStringArray1.forEach((word, index) => {
                                if (word.length == 0 ) {
                                    newStringArray1.splice(index, 1)//remove empty element("") from array
                                    index--;
                                } else {
                                    newData.forEach(stopWord => {
                                        if (word.toLocaleLowerCase() == stopWord.toLocaleLowerCase()) {
                                            newStringArray1.splice(index, 1)//remove matching word
                                            index--;
                                        }
                                    });
                                }
                            });
                            var value0 = newStringArray1.join(',');
                            let obj = {};
                            obj.Id = element.Id,
                            obj.ChapterNo = element.ChapterNo,
                            obj.VerseNo = element.VerseNo,
                            obj.VerseText = element.VerseText,
                            obj.After = value0
                            finalArray.push(obj);
                        });//temp end
                        let uniqueValuesArray = [];
                        finalArray.forEach((element,i) => {
                            let arr = String(element.After).replace(/,$/,'').split(',');
                            let  uniqueValues=[...new Set(arr)].join(',');
                            let obj ={};
                            obj.Id = element.Id,
                            obj.ChapterNo = element.ChapterNo,
                            obj.VerseNo = element.VerseNo,
                            obj.VerseText = element.VerseText,
                            obj.After = uniqueValues,
                            uniqueValuesArray.push(obj);
                            });
                            uniqueValuesArray.forEach(stopWord => {
                                
                                setData(data => [...data,
                                    {
                                        Id: stopWord.Id,
                                        ChapterNo: stopWord.ChapterNo,
                                        VerseNo: stopWord.VerseNo,
                                        VerseText: stopWord.VerseText,
                                        After: stopWord.After,
                                    }
                                    ]);
                        });
                    });//read file end
                    console.log('........................END...................');
                });
        });
    }, []);

    return (
        <View style={styles.container}>
            {/* <Text style={{ fontWeight: 'bold', color: '#3a53a6', fontSize: 40 }}>Quran And Hadees  </Text> */}
            <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={(item, index) =>
                    <View
                        style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 20, padding: 10, backgroundColor: '#eee' }}>
                        {/* <Text style={{ fontSize: 20, }}>SurahId : {item.item.SurahId}</Text>
                        <Text style={{ fontSize: 20, }}>AyatId : {item.item.AyatId}</Text> */}
                        <Text style={{ fontSize: 20, }}>Before : {item.item.VerseText}</Text>
                        <View style={{ borderColor: '#1ccc', borderBottomWidth: 1, width: '80%', alignSelf: 'center', margin: 5 }}></View>
                        <Text style={{ fontSize: 20, }}>After : {item.item.After}</Text>
                    </View>
                }
            />
            {/* <TouchableOpacity style={styles.button} onPress={() => removeExtra()}>
                <Text style={styles.buttonText}> Remove </Text>
            </TouchableOpacity> */}
        </View>
    );
}

export default Bible_StopWords;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
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

// chapter 1 verses 1
// Jild 1 hadees 1 