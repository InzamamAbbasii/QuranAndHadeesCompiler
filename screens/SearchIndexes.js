import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Feather from 'react-native-vector-icons/Feather';
import Highlighter from 'react-native-highlight-words';
import IModal from "../src/components/IModal";
import CongratsAlert from "../src/components/CongratsAlert";
import KeepAwake from "react-native-keep-awake";
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import RadioForm from 'react-native-simple-radio-button';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
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

    const [selectedItem, setSelectedItem] = useState(null);
    const [suggestionsList, setSuggestionsList] = useState(null)
    const [suggestionLoader, setSuggestionLoader] = useState(false);
    let c = 0;
    let lst = [];
    var radio_props = [
        { label: 'Quran ', value: 'Quran' },
        { label: 'Hadees  ', value: 'Hadees' },
        { label: 'Bible  ', value: 'Bible1' }
    ];

    const storeQuranKeyWords = async () => {
        setIsStore(true);
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

    let storeWordsAndSynonyms = async () => {
        setIsStore(true);
        await db.transaction(function (txn) {
            RNFS.readFileAssets('SynonymsList.txt', 'ascii').then(async (res) => {
                let newFile = res.split('\n');
                for (let index = 0; index < 5; index++) { //synonyms loop start
                    const fileData = newFile[index];
                    let [fileWord, ...fileSynonymsList] = fileData.split(/^\t|\s/); ///^\t|\s/
                    fileSynonymsList = fileSynonymsList.join(" ");
                    if (fileSynonymsList != undefined) {
                        // console.log(fileWord,' -- ' ,fileSynonymsList);
                        txn.executeSql(
                            `SELECT * FROM Keywords WHERE Word like ?`,
                            [fileWord],
                            function (tx, res) {
                                if (res.rows.length == 0) {
                                    tx.executeSql(
                                        'INSERT INTO KeyWords (Word) VALUES (?)',
                                        [fileWord],
                                        async(tx, results) => {
                                            if (results.rowsAffected > 0) {
                                                console.log(`${fileWord} Stored Successfully!`);
                                               await storeSynonyms(results.insertId, fileSynonymsList);
                                            } else alert('Something went worng...');
                                        }
                                    );
                                } else {
                                    tx.executeSql(
                                        'Select * from Keywords WHERE Word like ?',
                                        [fileWord],
                                       async (tx, results) => {
                                            console.log('already stored', fileWord, results.rows.item(0).KID);
                                           await storeSynonyms(results.rows.item(0).KID, fileSynonymsList)
                                        }
                                    );
                                }
                            });
                    }
                }
            });
        });//end db
        setIsStore(false);
    }
    const storeSynonyms = async (id, synonymsList) => {
        let words = synonymsList.split(',');
        //if word stored successfully then we will store synonyms of this word in Synonyms table
        words.forEach(async(element, index) => {
          await  db.transaction(function (tx) { //store synonyms
                tx.executeSql(
                    'SELECT * FROM Synonyms WHERE KID=? AND Synonym like ?',
                    [id, element],
                    (tx, results) => {
                        if (results.rows.length == 0) {
                            tx.executeSql(
                                'INSERT INTO Synonyms (Synonym,KID) VALUES (?,?)',
                                [element, id],
                                (tx, results) => {
                                    if (results.rowsAffected > 0) {
                                        console.log(`${id} Synonym ${element} Stored Successfully!`);
                                    } else alert('Something went worng...');
                                }
                            );
                        }

                    }
                );
            });//store synonyms end...
        });//loop end 
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
        console.log('......................................:::::::::::::::::::;')
        // await storeQuranKeyWords();
        // await storeBibleKeyWords();
        await storeWordsAndSynonyms();
        // getKeyWords();
        // getSynonyms();
    }, [])
    useEffect(() => {
        // console.log('.....', dataCopy.length);
        if (gettingDataFor == 'Quran')
            getMoreQuranData();
        else if (gettingDataFor == 'Hadees')
            getMoreHadeesData();
        else
            getMoreBibleData();

    }, [dataCopy]);
    // ................................GET MORE DATA ON FLATLIST END REACHED......................................
    const getMoreQuranData = () => {
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
            // console.log('done');
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
        setIsFetched(true); setSearch('');
        setGettingDataFor(tableName);
        console.log(`searchResult:${text} TableName : ${tableName}`);
        setData([]); setDataCopy([]);
        // setSearch(text);
        if (text) {
            let rowsLength = 0; var temp = [];
            if (tableName == "Quran") {
                getQuranData(text, tableName);
            } else if (tableName == "Hadees") {
                getHadeesData(text, tableName);
            } else if (tableName == "Bible1") {
                getBibleData(text, tableName);
            }
        } else {
            setIsFetched(false);
            alert('Please enter Word to search..');
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

    const getSuggestions = useCallback(async (q) => {
        setSuggestionLoader(true); setSuggestionsList([]);
        setSearch(q);
        if (q.length == 0) {
            setSuggestionsList(null); setSuggestionLoader(false);
            return
        }

        await db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '%${q}%'`,
                [],
                (tx, results) => {
                    var temp = [];
                    let count = 0;
                    for (let i = 0; i < results.rows.length; ++i) {
                        let obj = {
                            id: results.rows.item(i).SID,
                            title: results.rows.item(i).Synonym
                        }
                        if (obj.title.length > 0)
                            temp.push(obj);
                    }
                    setSuggestionsList(temp);
                }
            );
        });
        setSuggestionLoader(false);
    }, [])
    return (
        <View style={styles.container}>
            {
                isStore == true ? (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="green" />
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

                            {/* <TextInput style={styles.input}
                                onChangeText={(text) => setSearch(text)}
                                placeholder={'search here...'} placeholderTextColor={'gray'} /> */}

                            {
                                isFetched == true ? (
                                    <TextInput style={styles.input}
                                        onChangeText={(text) => setSearch(text)}
                                        placeholder={'search here...'} placeholderTextColor={'gray'} />
                                ) : (

                                    <AutocompleteDropdown
                                        clearOnFocus={false}
                                        closeOnBlur={false}

                                        closeOnSubmit={true}

                                        // initialValue={{ id: '2' }} // or just '2'
                                        onSelectItem={(item) => { item && setSearch(item.title) }}
                                        onChangeText={getSuggestions}
                                        dataSet={suggestionsList}
                                        debounce={400}
                                        suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
                                        // // onClear={onClearPress}
                                        //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
                                        onSubmit={(e) => searchResult(search, tableName)}
                                        // // onOpenSuggestionsList={onOpenSuggestionsList}
                                        loading={suggestionLoader}
                                        // useFilter={false} // prevent rerender twice
                                        textInputProps={{
                                            placeholder: "search here...",
                                            autoCorrect: false,
                                            autoCapitalize: "none",
                                            style: {
                                                borderRadius: 10,
                                                backgroundColor: "#000",
                                                color: "#fff",
                                                paddingLeft: 18,
                                            }
                                        }}
                                        rightButtonsContainerStyle={{
                                            borderRadius: 30,
                                            right: 8,
                                            height: 30,
                                            width: 30,
                                            top: 7,
                                            alignSelfs: "center",
                                            backgroundColor: "#000"
                                        }}
                                        inputContainerStyle={{
                                            backgroundColor: "transparent"
                                        }}
                                        suggestionsListContainerStyle={{
                                            backgroundColor: "#28D6C0",
                                        }}
                                        containerStyle={{ flex: 1.5 }}
                                        renderItem={(item, text) => (
                                            <Text style={{ color: "#fff", padding: 15 }}>{item.title}</Text>
                                        )}
                                        ChevronIconComponent={
                                            <Feather name="x-circle" size={18} color="#fff" />
                                        }
                                        ClearIconComponent={
                                            <Feather name="chevron-down" size={20} color="#fff" />
                                        }
                                        inputHeight={45}
                                        // showChevron={true}
                                        showClear={false}
                                    />
                                )
                            }


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