import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
var RNFS = require('react-native-fs');
const removeSuffix = require('remove-suffix')
const sw = require('remove-stopwords');
var pluralize = require('pluralize');
// var singular = require('pluralize-me');
import { singular, plural } from 'pluralize-me';
import ReadFile from "./ReadFile";
const AddSynonyms = ({ navigation }) => {
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


    const storeQuranKeyWords = async () => {
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='Quran_KeyWords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS Quran_KeyWords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS Quran_KeyWords(Id INTEGER PRIMARY KEY AUTOINCREMENT, SurahId INT, AyatId INT,AyatText TEXT ,Keywords TEXT)',
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
                                        for (let i = 0; i < 20; ++i)
                                            temp.push(results.rows.item(i));
                                    }
                                    let data = []; let finalArray = [];
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
                                        uniqueValuesArray.forEach(stopWord => {
                                            db.transaction(function (tx) {
                                                tx.executeSql(
                                                    'INSERT INTO Quran_KeyWords (SurahId, AyatId,AyatText, Keywords) VALUES (?,?,?,?)',
                                                    [stopWord.SurahId, stopWord.AyatId, stopWord.AyatText, stopWord.After],
                                                    (tx, results) => {
                                                        console.log('Inserted Id ', results.insertId);
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
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going to next screen..');
                        //   navigation.navigate('Quran');
                    }
                }
            );
        });
    }
    const storeHadeesKeyWords = async () => {
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='Hadees_KeyWords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS Hadees_KeyWords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS Hadees_KeyWords(Id INTEGER PRIMARY KEY AUTOINCREMENT, JildNo INT, HadeesNo INT, NarratedBy TEXT,HadeesText TEXT,Keywords TEXT)',
                            []
                        );


                        db.transaction((tx) => {
                            tx.executeSql(
                                'SELECT * FROM Hadees',
                                [],
                                (tx, results) => {
                                    var temp = [];
                                    console.log(results.rows.length);
                                    var len = results.rows.length;
                                    if (len > 0) {
                                        for (let i = 0; i < 20; ++i)
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
                                        uniqueValuesArray.forEach(stopWord => {
                                            db.transaction(function (tx) {
                                                tx.executeSql(
                                                    'INSERT INTO Hadees_KeyWords (JildNo, HadeesNo, NarratedBy,HadeesText ,Keywords) VALUES (?,?,?,?,?)',
                                                    [stopWord.JildNo, stopWord.HadeesNo, stopWord.NarratedBy, stopWord.HadeesText, stopWord.After],
                                                    (tx, results) => {
                                                        console.log('Inserted Id ', results.insertId);
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
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going in Hadees_Keyword database..');
                        //   navigation.navigate('Quran');
                    }
                }
            );
        });
    }
    const storeBibleKeyWords = async () => {
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='Bible_KeyWords'",
                [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        // TODO:if table is not created it will create new table otherwise it will do nothing.
                        txn.executeSql('DROP TABLE IF EXISTS Bible_KeyWords', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS Bible_KeyWords(Id INTEGER PRIMARY KEY AUTOINCREMENT, ChapterNo INT, VerseNo INT, VerseText TEXT,Keywords Text)',
                            []
                        );

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
                                        uniqueValuesArray.forEach(stopWord => {
                                            db.transaction(function (tx) {
                                                tx.executeSql(
                                                    'INSERT INTO Bible_KeyWords (ChapterNo, VerseNo, VerseText,Keywords ) VALUES (?,?,?,?)',
                                                    [stopWord.ChapterNo, stopWord.VerseNo, stopWord.VerseText, stopWord.After],
                                                    (tx, results) => {
                                                        console.log('Inserted Id ', results.insertId);
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
                        // ------------------------------------------------
                    } else {
                        console.log('Do nothing going in Bible_Keyword database..');
                        //   navigation.navigate('Quran');
                    }
                }
            );
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
    let getKeywordsAndStoreSynonyms = async () => {
        console.log(';;;;');
        let keywordsList = [];
        //read keywords from Quran_KeyWords
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT * FROM Quran_KeyWords",
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
                });
            txn.executeSql(
                "SELECT * FROM Hadees_KeyWords",
                [],
                function (tx, res) {
                    var temp = [];
                    // console.log(res.rows.length);
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
                });

            txn.executeSql(
                "SELECT * FROM Bible_KeyWords",
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
                            }
                        });
                    });
                });
        });
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
        setData('');
        console.log('useEffect.....');
        // await storeQuranKeyWords();
        // await storeHadeesKeyWords();
        // await storeBibleKeyWords();
        // await getKeywordsAndStoreSynonyms();
        // await getKeyWords();
        await getSynonyms();
    }, []);

    const storeSynonyms = () => {
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
                    let wordsList = [];
                    let data = []; let finalArray = [];
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
                            newStringArray1.forEach(element => {
                                if (element != "")
                                    wordsList.push(element);
                            });
                        });//temp end
                        let unique = [...new Set(wordsList)];
                        // console.log(unique);
                        // wordsList.forEach(element => {
                        //     console.log('word', element);
                        // });
                        //read synonyms from file 
                        RNFS.readFileAssets('SynonymsList.txt', 'ascii').then((res) => {
                            let newFile = res.split('\n');
                            let startingIndex = 0;
                            unique.forEach(element => {//words loop start
                                let word = "" + element;
                                for (let index = 0; index < newFile.length; index++) { //synonyms loop start
                                    const element = newFile[index];
                                    if (element.toLocaleLowerCase().match(word.toLocaleLowerCase())) {
                                        startingIndex = index;
                                        let [word, synonymsList] = element.split(/\t/);
                                        // console.log('word', word);
                                        let synonyms = synonymsList.split(',');

                                        //store data to database
                                        //check that word we want to store in database is already stored or not if it will already stored  
                                        //we will do nothing else store it in database and also add synonyms of that word
                                        db.transaction(function (txn) {
                                            txn.executeSql(
                                                `SELECT * FROM Keywords WHERE Word like ?`,
                                                [word],
                                                function (tx, res) {
                                                    if (res.rows.length == 0) {
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
                                                                        synonyms.forEach((element, index) => {
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
                                                    } else {
                                                        console.log(`${word} already stored in database`);
                                                    }
                                                });
                                        });
                                        // ............END OF STORING DATA TO DATABASE.............

                                        // synonyms.forEach((element, index) => {
                                        //     console.log(index, word, element);
                                        // });
                                        // break;
                                    }
                                }//synonyms loop end
                            });//words loop end
                        });
                        //read synonyms end
                    });//read file end

                    console.log('........................END...................');
                });
        })
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

export default AddSynonyms;
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