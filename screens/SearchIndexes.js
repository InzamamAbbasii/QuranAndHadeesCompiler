import React, { useState, useEffect, } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Highlighter from 'react-native-highlight-words';
import IModal from "../src/components/IModal";
import CongratsAlert from "../src/components/CongratsAlert";
import KeepAwake from "react-native-keep-awake";
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
const SearchIndexes = ({ navigation }) => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const [search, setSearch] = useState('');
    const [tableName, setTableName] = useState('Quran');
    const [searchArray, setSearchArray] = useState([]);
    const [data, setData] = useState([]);
    const [dataCopy, setDataCopy] = useState([]);
    const [isFetched, setIsFetched] = useState(false);
    const [isStore, setIsStore] = useState(true);
    const [gettingDataFor, setGettingDataFor] = useState('Quran');
    const [modalVisible, setModalVisible] = useState(false);
    const [showCongratsAlert, setShowCongratsAlert] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [totalData, setTotalData] = useState(0);
    const [savedData, setSavedData] = useState(0);
    let lst = [];
    var radio_props = [
        { label: 'Quran ', value: 'Quran' },
        { label: 'Hadees  ', value: 'Hadees' },
        { label: 'Bible  ', value: 'Bible1' }
    ];

    const storeQuranKeyWords = async () => {
        setIsStore(false);
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='StopWords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS StopWords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS StopWords(Id INTEGER PRIMARY KEY AUTOINCREMENT,TextId int,Keywords TEXT,BookName TEXT)',
                            []
                        );
                        db.transaction((tx) => {
                            tx.executeSql(
                                'SELECT * FROM Quran',
                                [],
                                (tx, results) => {
                                    var temp = [];
                                    var len = results.rows.length;
                                    if (len > 0) {
                                        for (let i = 0; i < len; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    let data = []; let finalArray = [];
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
                                            var value0 = newStringArray1.join(',');
                                            let obj = {};
                                            obj.Id = element.Id,
                                                obj.SurahId = element.SurahId,
                                                obj.AyatId = element.AyatId,
                                                obj.AyatText = element.AyatText,
                                                obj.After = value0,
                                                finalArray.push(obj);
                                        });//temp end
                                        let uniqueValuesArray = [];
                                        finalArray.forEach((element, i) => {
                                            let arr = String(element.After).replace(/,$/, '').split(',');
                                            let uniqueValues = [...new Set(arr)].join(',');
                                            let obj = {};
                                            obj.Id = element.Id,
                                                obj.SurahId = element.SurahId,
                                                obj.AyatId = element.AyatId,
                                                obj.AyatText = element.AyatText,
                                                obj.After = uniqueValues,
                                                uniqueValuesArray.push(obj);
                                        });
                                        setModalVisible(true);
                                        uniqueValuesArray.forEach(stopWord => {
                                            db.transaction(function (tx) {
                                                tx.executeSql(
                                                    'INSERT INTO StopWords (TextId, Keywords,BookName) VALUES (?,?,?)',
                                                    [stopWord.Id, stopWord.After, 'Quran'],
                                                    (tx, results) => {
                                                        console.log('Inserted Id ', results.insertId);
                                                        let per = (((results.insertId / uniqueValuesArray.length) * 100)/3).toFixed(0);
                                                        setPercentage(per);
                                                        setTotalData(uniqueValuesArray.length); setSavedData(results.insertId);
                                                        if (results.rowsAffected > 0) {
                                                            console.log('Data Stored Successfully!');
                                                        } else alert('Something went worng...');
                                                    }
                                                );
                                            });
                                        });
                                    });//read file end
                                    console.log('........................END...................');
                                });
                        });
                        storeHadeesKeyWords();
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going to next screen..');
                        //   navigation.navigate('Quran');
                        // storeHadeesKeyWords();
                        setIsStore(false);
                    }
                }
            );
        });
    }
    const storeHadeesKeyWords = async () => {

        await db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Hadees',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                    }
                    let data = []; let finalArray = [];
                    RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                        var newData = res.split(/\r?\n/);
                        temp.forEach((element, i) => {
                            var e = JSON.stringify(element.HadeesText);
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
                            var value0 = newStringArray1.join(',');

                            let obj = {};
                            obj.Id = element.Id,
                                obj.HadeesNo = element.HadeesNo,
                                obj.JildNo = element.JildNo,
                                obj.NarratedBy = element.NarratedBy,
                                obj.HadeesText = element.HadeesText,
                                obj.After = value0,
                                finalArray.push(obj);
                        });//temp end
                        let uniqueValuesArray = [];
                        finalArray.forEach((element, i) => {
                            let arr = String(element.After).replace(/,$/, '').split(',');
                            let uniqueValues = [...new Set(arr)].join(',');
                            let obj = {};
                            obj.Id = element.Id,
                                obj.HadeesNo = element.HadeesNo,
                                obj.JildNo = element.JildNo,
                                obj.NarratedBy = element.NarratedBy,
                                obj.HadeesText = element.HadeesText,
                                obj.After = uniqueValues,
                                uniqueValuesArray.push(obj);
                        });
                        // console.log('uniqueValues',uniqueValues);
                        let count=1;
                        uniqueValuesArray.forEach(stopWord => {
                            db.transaction(function (tx) {
                                tx.executeSql(
                                    'INSERT INTO StopWords (TextId ,Keywords,BookName) VALUES (?,?,?)',
                                    [stopWord.Id, stopWord.After, 'Hadees'],
                                    (tx, results) => {
                                        console.log('Inserted Id ', results.insertId);
                                        if (results.rowsAffected > 0) {
                                            let per = (((results.insertId / uniqueValuesArray.length) * 100)/3).toFixed(0);
                                            setPercentage(per);
                                            setTotalData(uniqueValuesArray.length); setSavedData(count++);
                                        } else alert('Something went worng...');
                                    }
                                );
                            });
                        });
                    });//read file end
                    console.log('........................END...................');
                });
        });
        storeBibleKeyWords();
    }
    const storeBibleKeyWords = async () => {
        setIsStore(false);setModalVisible(true);
        console.log('storing bible');
        await db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Bible1',
                [],
                (tx, results) => {
                    var temp = [];
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
                        finalArray.forEach((element, i) => {
                            let arr = String(element.After).replace(/,$/, '').split(',');
                            let uniqueValues = [...new Set(arr)].join(',');
                            let obj = {};
                            obj.Id = element.Id,
                                obj.ChapterNo = element.ChapterNo,
                                obj.VerseNo = element.VerseNo,
                                obj.VerseText = element.VerseText,
                                obj.After = uniqueValues,
                                uniqueValuesArray.push(obj);
                        });
                        let count=1;
                        uniqueValuesArray.forEach(stopWord => {
                                tx.executeSql(
                                    'INSERT INTO StopWords (TextId,Keywords,BookName ) VALUES (?,?,?)',
                                    [stopWord.Id, stopWord.After, 'Bible'],
                                    (tx, results) => {
                                        console.log('Inserted Id ', results.insertId);
                                        if (results.rowsAffected > 0) {
                                            let per = (((results.insertId / uniqueValuesArray.length) * 100)/3).toFixed(0);
                                            setPercentage(per);
                                            setTotalData(uniqueValuesArray.length); setSavedData(count++);
                                        } else alert('Something went worng...');
                                    }
                                );
                        });
                    });//read file end
                    console.log('........................END...................');
                });
            getKeywordsAndStoreSynonyms();
        });
    }

    let getKeywordsAndStoreSynonyms = async () => {
        console.log(';;;;');
        let keywordsList = [];
        //read keywords from Quran_KeyWords
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM StopWords",
                [],
                function (tx, res) {
                    var temp = [];
                    for (let i = 0; i < res.rows.length; ++i)
                        temp.push(res.rows.item(i).Keywords);
                    temp.forEach(element => {
                        if (element != "") {
                            let ele = "" + element;
                            let e = ele.split(','); //to store only one word in each index
                            e.forEach(element => {
                                keywordsList.push(element);
                                // setData(data => [...data, { KeyWord: element, Book: 'Quran' }])
                            });
                        }
                    });
                    // console.log(keywordsList);
                    let unique = [...new Set(keywordsList)];
                    // console.log(removeRepeatedWords);

                    unique.forEach((element, i) => {
                        RNFS.readFileAssets('SynonymsList.txt', 'ascii').then((res) => {
                            let newFile = res.split('\n');
                            let fileWord, fileSynonymsList;
                            let matchingIndex = -1;
                            for (let index = 0; index < newFile.length; index++) { //synonyms loop start
                                const fileData = newFile[index];
                                [fileWord, fileSynonymsList] = fileData.split(/\t|\s/);
                                if (element.toLocaleLowerCase() === fileWord.toLocaleLowerCase()) {
                                    matchingIndex = index;
                                }
                            }
                            if (matchingIndex != -1) {
                                const fileData = newFile[matchingIndex];
                                let fileWord1, fileSynonymsList1;
                                [fileWord1, fileSynonymsList1] = fileData.split(/\t/);
                                //check that word we want to store in database is already stored or not if it will already stored  
                                // we will do nothing else store it in database and also add synonyms of that word
                                db.transaction(function (txn) {
                                    txn.executeSql(
                                        `SELECT * FROM Keywords WHERE Word like ?`,
                                        [fileWord1],
                                        function (tx, res) {
                                            console.log(res.rows.length);
                                            if (res.rows.length == 0) {
                                                console.log('function called');
                                                storeSynonymsAndWords(fileWord1, fileSynonymsList1);
                                            } else {
                                                console.log('already stored');
                                            }
                                        });
                                });//end db
                                setIsStore(false);
                            }
                        });
                    });
                });
        });
    }
    const storeSynonymsAndWords = (word, synonymsList) => {
        // console.log(word, synonymsList);
        let words = synonymsList.split(',');
        db.transaction(function (tx) { //store word in KeyWords table
            tx.executeSql(
                'INSERT INTO KeyWords (Word) VALUES (?)',
                [word],
                (tx, results) => {
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        console.log(`${word} Stored Successfully!`);
                        let wordId = results.insertId;
                        //if word stored successfully then we will store synonms of this word in Synonyms table
                        words.forEach((element, index) => {
                            console.log(index, word, element);
                            db.transaction(function (tx) { //store synonyms
                                tx.executeSql(
                                    'INSERT INTO Synonyms (Synonym,KID) VALUES (?,?)',
                                    [element, wordId],
                                    (tx, results) => {
                                        console.log('Results', results.rowsAffected);
                                        if (results.rowsAffected > 0) {
                                            console.log(`Word ${word} ${results.insertId} ${element} Stored Successfully!`);
                                        } else alert('Something went worng...');
                                    }
                                );
                            });//store synonyms end...
                        });//loop end 
                    } else alert('Something went worng...');
                }
            );
        });//store word in KeyWords table end...

    }
    const getKeyWords = async () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM KeyWords',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    console.log(temp);
                }
            );
        });
    }
    const getSynonyms = async () => {
        console.log('Synonyms Data....');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Synonyms',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    console.log(temp);
                }
            );
        });
    }

    useEffect(async () => {
        // setIsStore(true);
        await storeQuranKeyWords();
        // await storeBibleKeyWords();
        // getSynonyms();
    }, [])


    const getQuranData = (text, tableName) => {
        setSearchArray([]);
        db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${text}'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log('sys ', results.rows.length);
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i).Synonym);
                        temp.forEach(element => {
                            // console.log('element', element);
                            setSearchArray(data => [...data, { Syn: element }]);
                            lst.push(element);
                            let searchWord = element;
                            var arr = [];
                            // `SELECT * FROM ${tableName} Where AyatText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE AyatText like '${element} %' or AyatText like'% ${element}' or AyatText like'% ${element} %' or AyatText like '${element}' or AyatText REGEXP ' ${element}(,|;|.") ' or AyatText REGEXP ' (,|;|.")${element} '`,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    // console.log(element, rowsLength);
                                    for (let i = 0; i < results.rows.length; ++i)
                                        arr.push(results.rows.item(i));
                                    if (rowsLength > 0) {
                                        if (rowsLength > 100) {
                                            for (let index = 0; index < 100; index++) {
                                                const element = arr[index];
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    SurahId: element.SurahId,
                                                    AyatId: element.AyatId,
                                                    AyatText: element.AyatText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            }
                                        } else {
                                            arr.forEach(element => {
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    SurahId: element.SurahId,
                                                    AyatId: element.AyatId,
                                                    AyatText: element.AyatText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            });
                                        }
                                        setIsFetched(false);
                                    }
                                });
                        });
                    } else {
                        console.log('else executed');
                        setSearchArray(data => [...data, { Syn: text }]);
                        // `SELECT * FROM ${tableName} Where AyatText like '%${text}%'`,
                        db.transaction((tx) => {
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE AyatText like '${text} %' or AyatText like'% ${text}' or AyatText like'% ${text} %' or AyatText like '${text}' or AyatText REGEXP ' ${text}(,|;|.?") ' or AyatText REGEXP ' (,|;|.?")${text} ' `,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    console.log('else rows..', rowsLength);
                                    if (rowsLength < 100) {
                                        for (let i = 0; i < results.rows.length; ++i)
                                            temp.push(results.rows.item(i));
                                    } else {
                                        for (let i = 0; i < 100; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    if (rowsLength > 0) {
                                        temp.forEach(element => {
                                            setData(data => [...data,
                                            {
                                                Id: element.Id,
                                                SurahId: element.SurahId,
                                                AyatId: element.AyatId,
                                                AyatText: element.AyatText,
                                                SearchWord: text,
                                            }
                                            ]);
                                        });
                                        setIsFetched(false);
                                    } else {
                                        setIsFetched(false);
                                        alert("No record Found...")
                                    }
                                });
                        });

                    }//else
                });

        });
    }
    const getHadeesData = (text, tableName) => {
        setSearchArray([]);
        db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${text}'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log('sys ', results.rows.length);
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i).Synonym);
                        temp.forEach(element => {
                            setSearchArray(txt => [...txt, { element }]);
                            console.log('element', element, tableName);
                            setSearchArray(data => [...data, { Syn: element }]);
                            let searchWord = element;
                            var arr = [];
                            // `SELECT * FROM ${tableName} WHERE HadeesText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE HadeesText like '${element} %' or HadeesText like'% ${element}' or HadeesText like'% ${element} %' or HadeesText like '${element}' or HadeesText REGEXP ' ${element}(,|;|.?") ' or HadeesText REGEXP ' (,|;|.?")${element} ' `,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    for (let i = 0; i < results.rows.length; ++i)
                                        arr.push(results.rows.item(i));
                                    if (rowsLength > 0) {
                                        if (rowsLength > 100) {
                                            for (let index = 0; index < 100; index++) {
                                                const element = arr[index];
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    JildNo: element.JildNo,
                                                    HadeesNo: element.HadeesNo,
                                                    NarratedBy: element.NarratedBy,
                                                    HadeesText: element.HadeesText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            }
                                        } else {
                                            arr.forEach(element => {
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    JildNo: element.JildNo,
                                                    HadeesNo: element.HadeesNo,
                                                    NarratedBy: element.NarratedBy,
                                                    HadeesText: element.HadeesText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            });
                                        }
                                        setIsFetched(false);
                                    }
                                });
                        });
                    } else {
                        setSearchArray(data => [...data, { Syn: text }]);
                        // `SELECT * FROM ${tableName} WHERE HadeesText like '%${text}%'`,
                        db.transaction((tx) => {
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE HadeesText like '${text} %' or HadeesText like'% ${text}' or HadeesText like'% ${text} %' or HadeesText like '${text}' or HadeesText REGEXP ' ${text}(,|;|.?") ' or HadeesText REGEXP ' (,|;|.?")${text} ' `,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    if (rowsLength < 100) {
                                        for (let i = 0; i < results.rows.length; ++i)
                                            temp.push(results.rows.item(i));
                                    } else {
                                        for (let i = 0; i < 100; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    if (rowsLength > 0) {
                                        temp.forEach(element => {
                                            setData(data => [...data,
                                            {
                                                Id: element.Id,
                                                JildNo: element.JildNo,
                                                HadeesNo: element.HadeesNo,
                                                NarratedBy: element.NarratedBy,
                                                HadeesText: element.HadeesText,
                                                SearchWord: text,
                                            }
                                            ]);
                                        });
                                        setIsFetched(false);
                                    } else {
                                        setIsFetched(false);
                                        alert("No record Found...")
                                    }
                                });
                        }).catch(error => console.log(error));

                    }//else

                });

        });
    }
    const getBibleData = (text, tableName) => {
        setSearchArray([]);
        db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${text}'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log('sys ', results.rows.length);
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i).Synonym);
                        temp.forEach(element => {
                            // console.log('element',element);
                            let searchWord = element;
                            setSearchArray(data => [...data, { Syn: element }]);
                            var arr = [];
                            // `SELECT * FROM ${tableName} Where VerseText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE VerseText like '${element} %' or VerseText like'% ${element}' or VerseText like'% ${element} %' or VerseText like '${element}' or VerseText REGEXP ' ${element}(,|;|.?") ' or VerseText REGEXP ' (,|;|.?")${element} ' `,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    console.log(element, rowsLength);
                                    for (let i = 0; i < results.rows.length; ++i)
                                        arr.push(results.rows.item(i));
                                    if (rowsLength > 0) {
                                        if (rowsLength > 100) {
                                            for (let index = 0; index < 100; index++) {
                                                const element = arr[index];
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    ChapterNo: element.ChapterNo,
                                                    VerseNo: element.VerseNo,
                                                    VerseText: element.VerseText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            }
                                        } else {
                                            arr.forEach(element => {
                                                // console.log(element);
                                                setData(data => [...data,
                                                {
                                                    Id: element.Id,
                                                    ChapterNo: element.ChapterNo,
                                                    VerseNo: element.VerseNo,
                                                    VerseText: element.VerseText,
                                                    SearchWord: text,
                                                }
                                                ]);
                                            });
                                        }
                                        setIsFetched(false);
                                    }
                                });
                        });
                    } else {
                        setSearchArray(data => [...data, { Syn: text }]);
                        db.transaction((tx) => {
                            // `SELECT * FROM ${tableName} Where VerseText like '%${text}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE VerseText like '${text} %' or VerseText like'% ${text}' or VerseText like'% ${text} %' or VerseText like '${text}' or VerseText REGEXP ' ${text}(,|;|.?") ' or VerseText REGEXP ' (,|;|.?")${text} ' `,
                                [],
                                (tx, results) => {
                                    rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    if (rowsLength < 100) {
                                        for (let i = 0; i < results.rows.length; ++i)
                                            temp.push(results.rows.item(i));
                                    } else {
                                        for (let i = 0; i < 100; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    if (rowsLength > 0) {
                                        temp.forEach(element => {
                                            setData(data => [...data,
                                            {
                                                Id: element.Id,
                                                ChapterNo: element.ChapterNo,
                                                VerseNo: element.VerseNo,
                                                VerseText: element.VerseText,
                                                SearchWord: text,
                                            }
                                            ]);
                                        });
                                        setIsFetched(false);
                                    } else {
                                        setIsFetched(false);
                                        alert("No record Found...")
                                    }
                                });
                        });

                    }//else

                });

        });
    }
    const searchResult = (text, tableName) => {
        setIsFetched(true);
        setGettingDataFor(tableName);
        console.log(`searchResult:${text} TableName : ${tableName}`);
        setData([]);
        // setSearch(text);
        if (text) {
            console.log(search);
            let rowsLength = 0; var temp = [];
            if (tableName == "Quran") {
                getQuranData(text, tableName);
            } else if (tableName == "Hadees") {
                getHadeesData(text, tableName);
            } else if (tableName == "Bible1") {
                getBibleData(text, tableName);
            }
            // db.transaction((tx) => {
            //     if (tableName == "Quran") {
            //         tx.executeSql(
            //             `SELECT * FROM ${tableName} Where AyatText like '%${text}%'`,
            //             [],
            //             (tx, results) => {
            //                 rowsLength = results.rows.length;
            //                 if(rowsLength<10){
            //                     for (let i = 0; i < results.rows.length; ++i)
            //                         temp.push(results.rows.item(i));
            //                 }else{
            //                     for (let i = 0; i < 10; ++i)
            //                     temp.push(results.rows.item(i));
            //                 }
            //                 if (rowsLength > 0) {
            //                     temp.forEach(element => {
            //                         setData(data => [...data,
            //                         {
            //                             Id: element.Id,
            //                             SurahId: element.SurahId,
            //                             AyatId: element.AyatId,
            //                             AyatText: element.AyatText,
            //                         }
            //                         ]);
            //                     });
            //                     setIsFetched(false);
            //                 } else {
            //                     setIsFetched(false);
            //                     alert("No record Found...")
            //                 }
            //             });
            //     } else if (tableName == "Hadees") {
            //         tx.executeSql(
            //             `SELECT * FROM ${tableName} Where HadeesText like '%${text}%'`,
            //             [],
            //             (tx, results) => {
            //                 rowsLength = results.rows.length;
            //                 console.log('...', rowsLength);
            //                 if(rowsLength<10){
            //                     for (let i = 0; i < results.rows.length; ++i)
            //                         temp.push(results.rows.item(i));
            //                 }else{
            //                     for (let i = 0; i < 10; ++i)
            //                     temp.push(results.rows.item(i));
            //                 }
            //                 if (rowsLength > 0) {
            //                     temp.forEach(element => {
            //                         setData(data => [...data,
            //                         {
            //                             Id: element.Id,
            //                             JildNo: element.JildNo,
            //                             HadeesNo: element.HadeesNo,
            //                             NarratedBy: element.NarratedBy,
            //                             HadeesText: element.HadeesText,
            //                         }
            //                         ]);
            //                     });
            //                     setIsFetched(false);
            //                 } else {
            //                     setIsFetched(false);
            //                     alert("No record Found...")
            //                 }
            //             });
            //     } else if (tableName == "Bible1") {
            //         tx.executeSql(
            //             `SELECT * FROM ${tableName} Where VerseText like '%${text}%'`,
            //             [],
            //             (tx, results) => {
            //                 rowsLength = results.rows.length;
            //                 console.log('...', rowsLength);
            //                 if(rowsLength<10){
            //                     for (let i = 0; i < results.rows.length; ++i)
            //                         temp.push(results.rows.item(i));
            //                 }else{
            //                     for (let i = 0; i < 10; ++i)
            //                     temp.push(results.rows.item(i));
            //                 }
            //                 if (rowsLength > 0) {
            //                     temp.forEach(element => {
            //                         setData(data => [...data,
            //                         {
            //                             Id: element.Id,
            //                             ChapterNo: element.ChapterNo,
            //                             VerseNo: element.VerseNo,
            //                             VerseText: element.VerseText,
            //                         }
            //                         ]);
            //                     });
            //                     setIsFetched(false);
            //                 } else {
            //                     setIsFetched(false);
            //                     alert("No record Found...")
            //                 }
            //             });
            //     }
            // });
        } else {
            setData([]);
            alert('Please enter Word to search..');
            setIsFetched(false);
        }

    }
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
    return (
        <View style={styles.container}>
            {
                isStore == true ? (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="red" />
                    </View>
                ) : (
                    <View>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput style={styles.input}
                                onChangeText={(text) => setSearch(text)}
                                placeholder={'search here...'} placeholderTextColor={'gray'} />
                            <TouchableOpacity onPress={() => searchResult(search, tableName)}
                                style={{ height: 40, backgroundColor: '#015c92', flex: .5, borderRadius: 10, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center' }}>Search</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ backgroundColor: '#fff', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10, }}>
                            <Text style={{ fontSize: 18 }}>Search In:</Text>
                            <RadioForm
                                radio_props={radio_props}
                                initial={0}
                                formHorizontal={true}
                                buttonColor={'#50C900'}
                                buttonOuterSize={25}
                                selectedButtonColor={"#88cdf6"}
                                selectedLabelColor={"blue"}
                                labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
                                onPress={(value) => setTableName(value)}
                            />
                        </View>
                        {
                            isFetched == true ? (
                                <View style={[styles.container, styles.horizontal]}>
                                    <ActivityIndicator size="large" color="#000" />
                                </View>
                            ) : (
                                gettingDataFor == "Quran" ? (
                                    <FlatList showsVerticalScrollIndicator={false}
                                        data={data}
                                        keyExtractor={(item, index) => index}
                                        initialNumToRender={10}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                        renderItem={(item, index) =>
                                            <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                                TableName: tableName,
                                                SurahNo: item.item.SurahId,
                                                AyatNo: item.item.AyatId,
                                                Text: item.item.AyatText,
                                                SearchWord: item.item.SearchWord,
                                                SearchWord1: searchArray,
                                            })}
                                                style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                                                <Text style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10, fontSize: 12 }} >Surah No {item.item.SurahId} , Ayat No {item.item.AyatId}</Text>
                                                <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.AyatText}</Text>
                                            </TouchableOpacity>
                                        }
                                    />
                                ) : (
                                    gettingDataFor == "Hadees" ? (
                                        <FlatList showsVerticalScrollIndicator={false}
                                            data={data}
                                            keyExtractor={(item, index) => index}
                                            initialNumToRender={10}
                                            maxToRenderPerBatch={10}
                                            windowSize={10}
                                            renderItem={(item, index) =>
                                                <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                                    TableName: tableName,
                                                    JildNo: item.item.JildNo,
                                                    HadeesNo: item.item.HadeesNo,
                                                    NarratedBy: item.item.NarratedBy,
                                                    Text: item.item.HadeesText,
                                                    SearchWord: item.item.SearchWord,
                                                    SearchWord1: searchArray,
                                                })}
                                                    style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                                                    <Text style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10, fontSize: 12 }} >Jild No {item.item.JildNo} : Hadees No {item.item.HadeesNo}</Text>
                                                    <Text style={{ fontSize: 18, }} >{item.item.NarratedBy}</Text>
                                                    <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.HadeesText}</Text>
                                                </TouchableOpacity>
                                            }
                                        />
                                    ) : (
                                        <FlatList showsVerticalScrollIndicator={false}
                                            data={data}
                                            keyExtractor={(item, index) => index}
                                            initialNumToRender={10}
                                            maxToRenderPerBatch={10}
                                            windowSize={10}
                                            renderItem={(item, index) =>
                                                <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                                    TableName: tableName,
                                                    ChapterNo: item.item.ChapterNo,
                                                    VerseNo: item.item.VerseNo,
                                                    Text: item.item.VerseText,
                                                    SearchWord1: searchArray,
                                                    SearchWord: item.item.SearchWord,
                                                })}
                                                    style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>

                                                    <Text style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10, fontSize: 12 }} >Chapter No {item.item.ChapterNo} : Verse No {item.item.VerseNo}</Text>

                                                    <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.VerseText}</Text>
                                                </TouchableOpacity>
                                            }
                                        />
                                    )
                                )
                            )
                        }
                    </View>
                )
            }
        </View>
    );
}

export default SearchIndexes;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
    },
    input: {
        margin: 5,
        flex: 1.5,
        height: 40,
        color: '#000',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 30,
        alignSelf: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#ffffff'
    },
    text: {
        fontSize: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 10
    }
})