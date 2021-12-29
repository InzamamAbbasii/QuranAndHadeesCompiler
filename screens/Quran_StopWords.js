import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
var RNFS = require('react-native-fs');
const removeSuffix = require('remove-suffix')
const sw = require('remove-stopwords');
var pluralize = require('pluralize');
// var singular = require('pluralize-me');
import { singular, plural } from 'pluralize-me';
const Quran_StopWords = ({ navigation }) => {
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
                'SELECT * FROM Quran',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < 20; ++i)
                            temp.push(results.rows.item(i));
                    }
                    let data = []; let finalArray=[];
                    RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                        var newData = res.split(/\r?\n/);
                        temp.forEach((element, i) => {
                            data.push("1");
                            var e = JSON.stringify(element.AyatText);
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
                                            //   console.log(index,wordsArray[index]);
                                            newStringArray1.splice(index, 1)//remove matching word
                                            index--;
                                        }
                                    });
                                }
                            });
                            var value0 = newStringArray1.join(',');
                            let obj = {};
                            obj.Id = element.Id,
                            obj.SurahId = element.SurahId,
                            obj.AyatId = element.AyatId,
                            obj.AyatText = element.AyatText,
                            obj.After = value0,
                            finalArray.push(obj);
                         
                            Array(value0).forEach(stopWord => {
                                    setData(data => [...data,
                                        {
                                            Id: element.Id,
                                            SurahId: element.SurahId,
                                            AyatId: element.AyatId,
                                            AyatText: element.AyatText,
                                            After: stopWord,
                                        }
                                        ]);
                            });
                        });//temp end
                        let uniqueValuesArray = [];
                        finalArray.forEach((element,i) => {
                            console.log(element.After);
                            let arr = String(element.After).replace(/,$/,'').split(',');
                            let  uniqueValues=[...new Set(arr)].join(',');
                            let obj ={};
                            obj.Id = element.Id,
                            obj.SurahId = element.SurahId,
                            obj.AyatId = element.AyatId,
                            obj.AyatText = element.AyatText,
                            obj.After = uniqueValues,
                            uniqueValuesArray.push(obj);
                            });
                            // console.log('uniqueValues',uniqueValues);
                            uniqueValuesArray.forEach(stopWord => {
                                console.log(stopWord);
                                // let str= String(stopWord).replace(/\s/,',');
                                // console.log(str);
                                setData(data => [...data,
                                    {
                                        Id: stopWord.Id,
                                        SurahId: stopWord.SurahId,
                                        AyatId: stopWord.AyatId,
                                        AyatText: stopWord.AyatText,
                                        After: stopWord.After,
                                    }
                                    ]);
                        });
                    });//read file end
                    console.log('........................END...................');
                });
        });
    }, []);


    const test = () => {
        setData('');
        console.log(listOfStopWords);
        console.log(data);

        console.log('useEffect.....');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Quran',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < 4; ++i)
                            temp.push(results.rows.item(i));
                    }
                    let data = [];
                    temp.forEach(element => {
                        var e = JSON.stringify(element.AyatText);
                        var originalStr = "" + JSON.parse(e);
                        var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
                        var wordsArray = removeSpaces.split(' ');

                        let newStringArray = sw.removeStopwords(wordsArray);
                        let finalArray = [];
                        newStringArray.forEach(element => {
                            finalArray.push(element);
                        });
                        var value0 = finalArray.join(' ').replace(/,|;|\./g, '');
                        // console.log(value0.split(' ').join(','));
                        var value = value0.split(' ').join(',');
                        var obj = {};
                        obj.Id = element.Id,
                            obj.SurahId = element.SurahId,
                            obj.AyatId = element.AyatId,
                            obj.AyatText = element.AyatText,
                            obj.After = value,
                            data.push(obj);
                    });
                    data.forEach(element => {
                        // console.log(element);
                        setData(data => [...data,
                        {
                            Id: element.Id,
                            SurahId: element.SurahId,
                            AyatId: element.AyatId,
                            AyatText: element.AyatText,
                            After: element.After,
                        }
                        ]);
                    });
                    console.log('........................END...................');
                });
        });
    }


    const removeExtra = () => {
        const suffixArray = ['-ee', 'eer', 'er', 'ion', 'ism', 'ity', 'ment', 'ness', 'tion', 'sion', 'ship', 'th', 'able',
            'al', 'ant', 'ary', 'ful', 'ic', 'ious', 'ive', 'less', 'y', 'ed', 'en', 'er', 'ing', 'ize', 'ise',
            'ly', 'ward', 'wise', 'ac', 'ways', 'ical', 'ence', 'ery', 'ess', 'hoop', 'ist', 'ship', 'or', 'ate', 'ify', 'ing']
        RNFS.readFileAssets('1.txt').then((res) => {
            // console.log('read file res: ', res);
            const oldString = res.split(' ');
            console.log(oldString);
            const newStringArray = sw.removeStopwords(oldString);
            console.log(newStringArray);
            // let result, suffix;
            // // var sing = pluralize.singular('country’');
            // // var sing = singular('feet');
            // // console.log(sing);
            // var data = [];
            // newStringArray.forEach(element => {
            //     var makeSingular = singular(element);
            //     // var sing = pluralize.singular(element);
            //     // data.push(sing);
            //     for (let index = 0; index < suffixArray.length; index++) {
            //         const s = suffixArray[index];
            //         [result, suffix] = removeSuffix(makeSingular, s);
            //     }
            //     // console.log(result,suffix);
            //     data.push(result)
            // });
            // var newData = data.join(" ");
            // console.log(newData);
            // console.log(oldString);
            // const arr=[];
            // oldString.forEach(element => {
            //     var newElement=''; //es ing tion ed 
            //     if(element.endsWith('es')){
            //         newElement = element.replace('es','')
            //     }else if(element.endsWith('ing')){
            //         newElement = element.replace('ing','')
            //     }else if(element.endsWith('tion')){
            //         newElement = element.replace('tion','')
            //     }else if(element.endsWith('ed')){
            //         newElement = element.replace('ed','')
            //     }else if(element.endsWith('es')){
            //         newElement = element.replace('es','')
            //     }else if(element.endsWith('s')){
            //         newElement = element.replace('s','')
            //     }else{
            //         newElement = element;
            //     }
            //     arr.push(newElement)
            // });
            // arr.forEach(element => {
            //    console.log(element); 
            // });
            // const newStringArray = sw.removeStopwords(oldString);
            // console.log(newStringArray); 

            // newStringArray.forEach(element => {
            //     console.log(element.toString());
            // });
            // let newString = newStringArray.toString().split('\n');
            // console.log(newString);
            console.log('..................................');
            // for (let index = 0; index < 10; index++) {
            //   const element = newString[index].split(':');
            //   console.log(element); 
            //   console.log('::::::::::::::::::::::');
            // }
            //  navigation.navigate('ReadFile',{data1:newString})
            // setData(newString);
            // setData(res);  
        }).catch((err) => {
            console.log(err.message, err.code);
        });
    }
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
                        <Text style={{ fontSize: 20, }}>Before : {item.item.AyatText}</Text>
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

export default Quran_StopWords;
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