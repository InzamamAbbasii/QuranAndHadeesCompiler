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
import RadioForm from 'react-native-simple-radio-button';
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
    const [testData, setTestData] = useState([]);

    const [synonymsList, setSynonymsList] = useState([]);
    const [count, setCount] = useState(0);
    const [numOfIteration, setNumOfIteration] = useState(0);
    const [loading, setLoading] = useState(true);
    let c = 0;
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
                "SELECT name FROM sqlite_master WHERE type='table' AND name='AllKeyWords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS AllKeyWords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS AllKeyWords(Id INTEGER PRIMARY KEY AUTOINCREMENT,ReferenceId int,Keywords TEXT,BookName TEXT)',
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
                                                    'INSERT INTO AllKeyWords (ReferenceId, Keywords,BookName) VALUES (?,?,?)',
                                                    [stopWord.Id, stopWord.After, 'Quran'],
                                                    (tx, results) => {
                                                        console.log('Inserted Id ', results.insertId);
                                                        let per = (((results.insertId / uniqueValuesArray.length) * 100) / 3).toFixed(0);
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
                        let count = 1;
                        uniqueValuesArray.forEach(stopWord => {
                            db.transaction(function (tx) {
                                tx.executeSql(
                                    'INSERT INTO AllKeyWords (ReferenceId ,Keywords,BookName) VALUES (?,?,?)',
                                    [stopWord.Id, stopWord.After, 'Hadees'],
                                    (tx, results) => {
                                        console.log('Inserted Id ', results.insertId);
                                        if (results.rowsAffected > 0) {
                                            let per = (((results.insertId / uniqueValuesArray.length) * 100) / 3).toFixed(0);
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
        setIsStore(false); setModalVisible(true);
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
                        let count = 1;
                        uniqueValuesArray.forEach(stopWord => {
                            tx.executeSql(
                                'INSERT INTO AllKeyWords (ReferenceId,Keywords,BookName ) VALUES (?,?,?)',
                                [stopWord.Id, stopWord.After, 'Bible'],
                                (tx, results) => {
                                    console.log('Inserted Id ', results.insertId);
                                    if (results.rowsAffected > 0) {
                                        let per = (((results.insertId / uniqueValuesArray.length) * 100) / 3).toFixed(0);
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

    let getQuranKeywordsAndStoreSynonyms = async () => {
        console.log('Quran Called');
        let keywordsList = [];
        //read keywords from Quran_KeyWords
        var temp = [];
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM Quran",
                [],
                function (txx, res) {
                    console.log('length : ', res.rows.length);
                    for (let i = 0; i < res.rows.length; ++i)
                        temp.push(res.rows.item(i).Keywords);
                    temp.forEach(element => {
                        if (element != "") {
                            let ele = "" + element.replace(/[`~!@#$%^&*()_|+\=?;.<>\{\}\[\]\\\/]/gi, '');
                            let e = ele.split(','); //to store only one word in each index
                            e.forEach(element => {
                                let ele = element.charAt(0).toUpperCase() + element.substring(1)
                                keywordsList.push(ele);
                                // setData(data => [...data, { KeyWord: element, Book: 'Quran' }])
                            });
                        }
                    });
                    // console.log(keywordsList);
                    let unique = [...new Set(keywordsList)];
                    // console.log(unique);
                    RNFS.readFileAssets('SynonymsList.txt', 'ascii').then((res) => {
                        let newFile = res.split('\n');
                        unique.forEach((element, i) => {
                            let fileWord, fileSynonymsList;
                            let matchingIndex = -1;
                            for (let index = 0; index < newFile.length; index++) { //synonyms loop start
                                const fileData = newFile[index];
                                [fileWord, fileSynonymsList] = fileData.split(/\t|\s/);
                                if (element.toLocaleLowerCase() === fileWord.toLocaleLowerCase()) {
                                    matchingIndex = index;
                                    console.log('word matched', fileWord, element);
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
                        console.log('completed..');
                        getHadeesKeywordsAndStoreSynonyms();
                    });
                });

        });
        // getHadeesKeywordsAndStoreSynonyms();
    }
    let getHadeesKeywordsAndStoreSynonyms = async () => {
        console.log('Hadess Called');
        let keywordsList = [];
        //read keywords from Quran_KeyWords
        var temp = [];
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM Hadees",
                [],
                function (txx, res) {
                    console.log('length : ', res.rows.length);
                    for (let i = 0; i < res.rows.length; ++i)
                        temp.push(res.rows.item(i).Keywords);
                    temp.forEach(element => {
                        if (element != "") {
                            let ele = "" + element.replace(/[`~!@#$%^&*()_|+\=?;.<>\{\}\[\]\\\/]/gi, '');
                            let e = ele.split(','); //to store only one word in each index
                            e.forEach(element => {
                                let ele = element.charAt(0).toUpperCase() + element.substring(1)
                                keywordsList.push(ele);
                                // setData(data => [...data, { KeyWord: element, Book: 'Quran' }])
                            });
                        }
                    });
                    // console.log(keywordsList);
                    let unique = [...new Set(keywordsList)];
                    // console.log(unique);
                    RNFS.readFileAssets('SynonymsList.txt', 'ascii').then((res) => {
                        let newFile = res.split('\n');
                        unique.forEach((element, i) => {
                            let fileWord, fileSynonymsList;
                            let matchingIndex = -1;
                            for (let index = 0; index < newFile.length; index++) { //synonyms loop start
                                const fileData = newFile[index];
                                [fileWord, fileSynonymsList] = fileData.split(/\t|\s/);
                                if (element.toLocaleLowerCase() === fileWord.toLocaleLowerCase()) {
                                    matchingIndex = index;
                                    console.log('word matched', fileWord, element);
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
                         getBibleKeywordsAndStoreSynonyms();
                    });
                });

        });
    }
    let getBibleKeywordsAndStoreSynonyms = async () => {
        console.log('Bible Called');
        let keywordsList = [];
        //read keywords from Quran_KeyWords
        var temp = [];
        await db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM Bible1",
                [],
                function (txx, res) {
                    console.log('length : ', res.rows.length);
                    for (let i = 0; i < res.rows.length; ++i)
                        temp.push(res.rows.item(i).Keywords);
                    temp.forEach(element => {
                        if (element != "") {
                            let ele = "" + element.replace(/[`~!@#$%^&*()_|+\=?;.<>\{\}\[\]\\\/]/gi, '');
                            let e = ele.split(','); //to store only one word in each index
                            e.forEach(element => {
                                let ele = element.charAt(0).toUpperCase() + element.substring(1)
                                keywordsList.push(ele);
                                // setData(data => [...data, { KeyWord: element, Book: 'Quran' }])
                            });
                        }
                    });
                    // console.log(keywordsList);
                    let unique = [...new Set(keywordsList)];
                    // console.log(unique);
                    RNFS.readFileAssets('SynonymsList.txt', 'ascii').then((res) => {
                        let newFile = res.split('\n');
                        unique.forEach((element, i) => {
                            let fileWord, fileSynonymsList;
                            let matchingIndex = -1;
                            for (let index = 0; index < newFile.length; index++) { //synonyms loop start
                                const fileData = newFile[index];
                                [fileWord, fileSynonymsList] = fileData.split(/\t|\s/);
                                if (element.toLocaleLowerCase() === fileWord.toLocaleLowerCase()) {
                                    matchingIndex = index;
                                    console.log('word matched', fileWord, element);
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
        setIsStore(false);
        // await storeQuranKeyWords();
        // await storeBibleKeyWords();
        // await getQuranKeywordsAndStoreSynonyms();
        // await getHadeesKeywordsAndStoreSynonyms();
        // await getBibleKeywordsAndStoreSynonyms();
        getKeyWords();
        // getSynonyms();
    }, [])
    useEffect(() => {
        console.log('.....', dataCopy.length);
        if (gettingDataFor == 'Quran')
            getMoreQuranData();
        else if (gettingDataFor == 'Hadees')
            getMoreHadeesData();
        else
            getMoreBibleData();

    }, [dataCopy]);
    // ................................GET MORE DATA ON FLATLIST END REACHED......................................
    const getMoreQuranData = () => {
        console.log('called...');
        const Record_Per_Fetch = 10;
        setLoading(true);
        console.log(`Data Length ${data.length}  ,  DataCopy Length  ${dataCopy.length}  ,  NumOfIteration ${numOfIteration}`);
        if (data.length < dataCopy.length) {
            // console.log('inside main if',dataCopy.length,Record_Per_Fetch,numOfIteration,(numOfIteration+Record_Per_Fetch));
            if (dataCopy.length < Record_Per_Fetch || dataCopy.length < (numOfIteration + Record_Per_Fetch)) {
                console.log('if');
                for (let index = data.length; index < dataCopy.length; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        SurahId: element.SurahId,
                        AyatId: element.AyatId,
                        AyatText: element.AyatText,
                        // SearchWord: text,
                    }
                    ]);
                    setNumOfIteration(numOfIteration + Record_Per_Fetch);
                }
            } else {
                console.log('else ', numOfIteration, Record_Per_Fetch);
                for (let index = numOfIteration; index < numOfIteration + Record_Per_Fetch; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        SurahId: element.SurahId,
                        AyatId: element.AyatId,
                        AyatText: element.AyatText,
                        // SearchWord: text,
                    }
                    ]);
                }
                setNumOfIteration(numOfIteration + Record_Per_Fetch);
            }
        }
        else {
            console.log('done');
            setLoading(false);
        }
    }
    const getMoreHadeesData = () => {
        console.log('called...');
        const Record_Per_Fetch = 10;
        setLoading(true);
        console.log(`Data Length ${data.length}  ,  DataCopy Length  ${dataCopy.length}  ,  NumOfIteration ${numOfIteration}`);
        if (data.length < dataCopy.length) {
            // console.log('inside main if',dataCopy.length,Record_Per_Fetch,numOfIteration,(numOfIteration+Record_Per_Fetch));
            if (dataCopy.length < Record_Per_Fetch || dataCopy.length < (numOfIteration + Record_Per_Fetch)) {
                console.log('if');
                for (let index = data.length; index < dataCopy.length; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        JildNo: element.JildNo,
                        HadeesNo: element.HadeesNo,
                        NarratedBy: element.NarratedBy,
                        HadeesText: element.HadeesText,
                        // SearchWord: text,
                    }
                    ]);
                    setNumOfIteration(numOfIteration + Record_Per_Fetch);
                }
            } else {
                console.log('else ', numOfIteration, Record_Per_Fetch);
                for (let index = numOfIteration; index < numOfIteration + Record_Per_Fetch; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        JildNo: element.JildNo,
                        HadeesNo: element.HadeesNo,
                        NarratedBy: element.NarratedBy,
                        HadeesText: element.HadeesText,
                        // SearchWord: text,
                    }
                    ]);
                }
                setNumOfIteration(numOfIteration + Record_Per_Fetch);
            }
        }
        else {
            console.log('done');
            setLoading(false);
        }

    }
    const getMoreBibleData = () => {
        console.log('called...');
        const Record_Per_Fetch = 10;
        setLoading(true);
        console.log(`Data Length ${data.length}  ,  DataCopy Length  ${dataCopy.length}  ,  NumOfIteration ${numOfIteration}`);
        if (data.length < dataCopy.length) {
            // console.log('inside main if',dataCopy.length,Record_Per_Fetch,numOfIteration,(numOfIteration+Record_Per_Fetch));
            if (dataCopy.length < Record_Per_Fetch || dataCopy.length < (numOfIteration + Record_Per_Fetch)) {
                console.log('if');
                for (let index = data.length; index < dataCopy.length; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        ChapterNo: element.ChapterNo,
                        VerseNo: element.VerseNo,
                        VerseText: element.VerseText,
                        BookName: element.BookName,

                        // SearchWord: text,
                    }
                    ]);
                    setNumOfIteration(numOfIteration + Record_Per_Fetch);
                }
            } else {
                console.log('else ', numOfIteration, Record_Per_Fetch);
                for (let index = numOfIteration; index < numOfIteration + Record_Per_Fetch; index++) {
                    const element = dataCopy[index];
                    setData(data => [...data,
                    {
                        Id: element.Id,
                        ChapterNo: element.ChapterNo,
                        VerseNo: element.VerseNo,
                        VerseText: element.VerseText,
                        BookName: element.BookName,

                        // SearchWord: text,
                    }
                    ]);
                }
                setNumOfIteration(numOfIteration + Record_Per_Fetch);
            }
        }
        else {
            console.log('done');
            setLoading(false);
        }

    }

    // ................................END GETTING MORE DATA ON FLATLIST END REACHED......................................
    const getQuranData = async (text, tableName) => {
        setSearchArray([]); setDataCopy([]); setNumOfIteration(0);
        await db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${text}'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log('sys ', results.rows.length);
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i).Synonym);
                        var arr = [];
                        temp.forEach((element, index) => {
                            // `SELECT * FROM ${tableName} Where AyatText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE AyatText like '${element} %' or AyatText like'% ${element}' or AyatText like'% ${element} %' or AyatText like '${element}' or AyatText REGEXP ' ${element}(,|;|.") ' or AyatText REGEXP ' (,|;|.")${element} '`,
                                [],
                                (tx, results) => {
                                    let rowsLength = results.rows.length;
                                    setSearchArray(data => [...data, { Syn: element }]);
                                    lst.push(element);
                                    let searchWord = element;
                                    // console.log(element, rowsLength);
                                    for (let i = 0; i < results.rows.length; ++i) {
                                        let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                        if (found == false) {
                                            arr.push(results.rows.item(i));
                                        }
                                    }
                                    if (arr.length > 10) {
                                        setDataCopy(arr);
                                    } else if (arr.length < 10 && index == temp.length - 1) {
                                        setDataCopy(arr);
                                    }
                                    if (arr.length == 0 && index == temp.length - 1) {
                                        alert('No record found.')
                                    }
                                    // if (rowsLength > 0) {
                                    //     if (rowsLength > 2) {
                                    //         for (let index = 0; index < 2; index++) {
                                    //             const element = arr[index];
                                    //             let found = data.some(s => s.Id == element.Id);
                                    //             if (found == false) {
                                    //                 setData(data => [...data,
                                    //                 {
                                    //                     Id: element.Id,
                                    //                     SurahId: element.SurahId,
                                    //                     AyatId: element.AyatId,
                                    //                     AyatText: element.AyatText,
                                    //                     SearchWord: text,
                                    //                 }
                                    //                 ]);
                                    //             }
                                    //         }
                                    //     }
                                    // }
                                    //     // else {
                                    //     // arr.forEach(element => {
                                    //     //     let found = data.some(s => s.Id == element.Id);
                                    //     //     if (found == false) {
                                    //     //         setData(data => [...data,
                                    //     //         {
                                    //     //             Id: element.Id,
                                    //     //             SurahId: element.SurahId,
                                    //     //             AyatId: element.AyatId,
                                    //     //             AyatText: element.AyatText,
                                    //     //             SearchWord: text,
                                    //     //         }
                                    //     //         ]);
                                    //     //         setDataCopy(data => [...data,
                                    //     //             {
                                    //     //                 Id: element.Id,
                                    //     //                 SurahId: element.SurahId,
                                    //     //                 AyatId: element.AyatId,
                                    //     //                 AyatText: element.AyatText,
                                    //     //                 SearchWord: text,
                                    //     //             }
                                    //     //             ]);
                                    //     //     }
                                    //     // });
                                    //     // }
                                    setIsFetched(false);
                                    // }
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
                                    var arr = [];
                                    let rowsLength = results.rows.length;
                                    console.log('else rows..', rowsLength);
                                    if (rowsLength > 0) {
                                        for (let i = 0; i < results.rows.length; ++i) {
                                            let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                            if (found == false) {
                                                arr.push(results.rows.item(i));
                                            }
                                        }
                                        setDataCopy(arr);
                                        setIsFetched(false);
                                    } else {
                                        alert('No record found');
                                        setIsFetched(false);
                                    }
                                    // if (rowsLength < 100) {
                                    //     for (let i = 0; i < results.rows.length; ++i)
                                    //         temp.push(results.rows.item(i));
                                    // } else {
                                    //     for (let i = 0; i < 100; ++i)
                                    //         temp.push(results.rows.item(i));
                                    // }
                                    // if (rowsLength > 0) {
                                    //     temp.forEach(element => {
                                    //         setData(data => [...data,
                                    //         {
                                    //             Id: element.Id,
                                    //             SurahId: element.SurahId,
                                    //             AyatId: element.AyatId,
                                    //             AyatText: element.AyatText,
                                    //             SearchWord: text,
                                    //         }
                                    //         ]);
                                    //     });
                                    //     setIsFetched(false);
                                    // } else {
                                    //     setIsFetched(false);
                                    //     alert("No record Found...")
                                    // }
                                });
                        });

                    }//else
                });

        });

    }
    const getHadeesData = async (text, tableName) => {
        setSearchArray([]); setDataCopy([]); setNumOfIteration(0);
        await db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${text}'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log('sys ', results.rows.length);
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i).Synonym);
                        var arr = [];
                        temp.forEach((element, index) => {
                            // setSearchArray(txt => [...txt, { element }]);
                            setSearchArray(data => [...data, { Syn: element }]);
                            let searchWord = element;
                            // `SELECT * FROM ${tableName} WHERE HadeesText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} WHERE HadeesText like '${element} %' or HadeesText like'% ${element}' or HadeesText like'% ${element} %' or HadeesText like '${element}' or HadeesText REGEXP ' ${element}(,|;|.?") ' or HadeesText REGEXP ' (,|;|.?")${element} ' `,
                                [],
                                (tx, results) => {
                                    let rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    for (let i = 0; i < results.rows.length; ++i) {
                                        let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                        if (found == false) {
                                            arr.push(results.rows.item(i));
                                        }
                                    }
                                    if (arr.length > 10) {
                                        setDataCopy(arr);
                                    } else if (arr.length < 10 && index == temp.length - 1) {
                                        setDataCopy(arr);
                                    }
                                    if (arr.length == 0 && index == temp.length - 1) {
                                        alert('No record found.');
                                    }
                                    setIsFetched(false);
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
                                    let rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    let arr = [];
                                    if (rowsLength > 0) {
                                        for (let i = 0; i < results.rows.length; ++i) {
                                            let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                            if (found == false) {
                                                arr.push(results.rows.item(i));
                                            }
                                        }
                                        setDataCopy(arr);
                                        setIsFetched(false);
                                    } else {
                                        setIsFetched(false);
                                        alert("No record Found...")
                                    }
                                });
                        }).catch(error => console.log(error));

                    }
                });
        });
    }
    const getBibleData = (text, tableName) => {
        setSearchArray([]); setDataCopy([]); setNumOfIteration(0);
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
                        var arr = [];
                        temp.forEach(element => {
                            let searchWord = element;
                            setSearchArray(data => [...data, { Syn: element }]);
                            // `SELECT * FROM ${tableName} Where VerseText like '%${element}%'`,
                            tx.executeSql(
                                `SELECT * FROM ${tableName} JOIN BibleBooks on Bible1.BookId=BibleBooks.Id WHERE VerseText like '${element} %' or VerseText like'% ${element}' or VerseText like'% ${element} %' or VerseText like '${element}' or VerseText REGEXP ' ${element}(,|;|.?") ' or VerseText REGEXP ' (,|;|.?")${element} ' `,
                                [],
                                (tx, results) => {
                                    let rowsLength = results.rows.length;
                                    for (let i = 0; i < results.rows.length; ++i) {
                                        let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                        if (found == false) {
                                            arr.push(results.rows.item(i));
                                        }
                                    }
                                    if (arr.length > 10) {
                                        setDataCopy(arr);
                                    } else if (arr.length < 10 && index == temp.length - 1) {
                                        setDataCopy(arr);
                                    }
                                    if (arr.length == 0 && index == temp.length - 1) {
                                        alert('No record found.');
                                    }
                                    setIsFetched(false);
                                });
                        });
                    } else {
                        setSearchArray(data => [...data, { Syn: text }]);
                        db.transaction((tx) => {
                            tx.executeSql(
                                `SELECT * FROM ${tableName} JOIN BibleBooks on Bible1.BookId=BibleBooks.Id WHERE VerseText like '${text} %' or VerseText like'% ${text}' or VerseText like'% ${text} %' or VerseText like '${text}' or VerseText REGEXP ' ${text}(,|;|.?") ' or VerseText REGEXP ' (,|;|.?")${text} ' `,
                                [],
                                (tx, results) => {
                                    let rowsLength = results.rows.length;
                                    console.log(rowsLength);
                                    let arr = [];
                                    if (rowsLength > 0) {
                                        for (let i = 0; i < results.rows.length; ++i) {
                                            let found = arr.some(s => s.Id == results.rows.item(i).Id);
                                            if (found == false) {
                                                arr.push(results.rows.item(i));
                                            }
                                        }
                                        setDataCopy(arr);
                                        setIsFetched(false);
                                    } else {
                                        setIsFetched(false);
                                        alert("No record Found...")
                                    }
                                });
                        });
                    }
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
    const renderFooter = () => {
        return (
            <View>
                {
                    loading && <ActivityIndicator color="red" size={'large'} />
                }
            </View>
        );
    };
    return (
        <View style={styles.container}>
            {
                isStore == true ? (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="red" />
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
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
                                        onEndReachedThreshold={0.01}
                                        onEndReached={getMoreQuranData}
                                        ListFooterComponent={renderFooter}
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
                                            onEndReachedThreshold={0.01}
                                            onEndReached={getMoreHadeesData}
                                            ListFooterComponent={renderFooter}
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
                                            onEndReachedThreshold={0.01}
                                            onEndReached={getMoreBibleData}
                                            ListFooterComponent={renderFooter}
                                            renderItem={(item, index) =>
                                                <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                                    TableName: tableName,
                                                    ChapterNo: item.item.ChapterNo,
                                                    VerseNo: item.item.VerseNo,
                                                    Text: item.item.VerseText,
                                                    SearchWord1: searchArray,
                                                    BookName: item.item.BookName,
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
    },
})