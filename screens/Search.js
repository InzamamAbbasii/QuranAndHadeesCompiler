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
const Search = ({ navigation }) => {
  var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
  const [search, setSearch] = useState('');
  const [tableName, setTableName] = useState('Quran');
  const [searchArray, setSearchArray] = useState([]);
  const [data, setData] = useState([]);
  const [dataCopy, setDataCopy] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isStore, setIsStore] = useState(false);
  const [gettingDataFor, setGettingDataFor] = useState('Quran');
  const [modalVisible, setModalVisible] = useState(false);
  const [showCongratsAlert, setShowCongratsAlert] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [savedData, setSavedData] = useState(0);
  const [numOfIteration, setNumOfIteration] = useState(0);
  const [loading, setLoading] = useState(true);

  let lst = [];
  var radio_props = [
    { label: 'Quran ', value: 'Quran' },
    { label: 'Hadees  ', value: 'Hadees' },
    { label: 'Bible  ', value: 'Bible1' }
  ];

  const storeQuranKeyWords = async () => {
    await db.transaction(function (txn) {
      txn.executeSql(
        "Select * from Quran",
        [],
        function (tx, res) {
          var temp = [];
          var len = res.rows.length;
          if (len > 0) {
            for (let i = 0; i < len; ++i)
              temp.push(res.rows.item(i));
            if (res.rows.item(len - 1).Keywords == undefined) {
              console.log('column not found');
              txn.executeSql("Alter table Quran Add Column Keywords TEXT", [])
              console.log('coulmn added...');
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
                      'UPDATE Quran set Keywords=? where Id=?',
                      [uniqueValues, element.Id],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          let per = (((element.Id / temp.length) * 100) / 3).toFixed(0);
                          setPercentage(per * 3);
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
  const storeHadeesKeyWords = async () => {
    await db.transaction(function (txn) {
      txn.executeSql(
        "Select * from Hadees",
        [],
        function (tx, res) {
          var temp = [];
          var len = res.rows.length;
          if (len > 0) {
            for (let i = 0; i < len; ++i)
              temp.push(res.rows.item(i));
            if (res.rows.item(len - 1).Keywords == undefined) {
              console.log('column not found');
              txn.executeSql("Alter table Hadees Add Column Keywords TEXT", [])
              console.log('coulmn added...');
              RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
                var newData = res.split(/\r?\n/);
                temp.forEach((element, i) => {
                  var e = JSON.stringify(element.HadeesText);
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
                      'UPDATE Hadees set Keywords=? where Id=?',
                      [uniqueValues, element.Id],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          let per = (((element.Id / temp.length) * 100) / 3).toFixed(0);
                          setPercentage(per * 3);
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
    // await db.transaction((tx) => {
    //   tx.executeSql(
    //     'SELECT * FROM Hadees',
    //     [],
    //     (tx, results) => {
    //       var temp = [];
    //       console.log(results.rows.length);
    //       var len = results.rows.length;
    //       if (len > 0) {
    //         for (let i = 0; i < len; ++i)
    //           temp.push(results.rows.item(i));
    //       }
    //       let data = []; let finalArray = [];
    //       RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
    //         var newData = res.split(/\r?\n/);
    //         temp.forEach((element, i) => {
    //           var e = JSON.stringify(element.HadeesText);
    //           var originalStr = "" + JSON.parse(e);
    //           var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
    //           var removeExtraSymbols = removeSpaces.replace(/[^a-zA-Z ]/g, "");
    //           var wordsArray = removeExtraSymbols.split(' ');
    //           let newStringArray1 = sw.removeStopwords(wordsArray);
    //           newStringArray1.forEach((word, index) => {
    //             if (word.length == 0) {
    //               newStringArray1.splice(index, 1)//remove empty element("") from array
    //               index--;
    //             } else {
    //               newData.forEach(stopWord => {
    //                 if (word.toLocaleLowerCase() == stopWord.toLocaleLowerCase()) {
    //                   //   console.log(index,wordsArray[index]);
    //                   newStringArray1.splice(index, 1)//remove matching word
    //                   index--;
    //                 }
    //               });
    //             }
    //           });
    //           var value0 = newStringArray1.join(',');

    //           let obj = {};
    //           obj.Id = element.Id,
    //             obj.HadeesNo = element.HadeesNo,
    //             obj.JildNo = element.JildNo,
    //             obj.NarratedBy = element.NarratedBy,
    //             obj.HadeesText = element.HadeesText,
    //             obj.After = value0,
    //             finalArray.push(obj);
    //         });//temp end
    //         let uniqueValuesArray = [];
    //         finalArray.forEach((element, i) => {
    //           let arr = String(element.After).replace(/,$/, '').split(',');
    //           let uniqueValues = [...new Set(arr)].join(',');
    //           let obj = {};
    //           obj.Id = element.Id,
    //             obj.HadeesNo = element.HadeesNo,
    //             obj.JildNo = element.JildNo,
    //             obj.NarratedBy = element.NarratedBy,
    //             obj.HadeesText = element.HadeesText,
    //             obj.After = uniqueValues,
    //             uniqueValuesArray.push(obj);
    //         });
    //         // console.log('uniqueValues',uniqueValues);
    //         let count = 1;
    //         uniqueValuesArray.forEach(stopWord => {
    //           db.transaction(function (tx) {
    //             tx.executeSql(
    //               'INSERT INTO StopWords (TextId ,Keywords,BookName) VALUES (?,?,?)',
    //               [stopWord.Id, stopWord.After, 'Hadees'],
    //               (tx, results) => {
    //                 console.log('Inserted Id ', results.insertId);
    //                 if (results.rowsAffected > 0) {
    //                   let per = (((results.insertId / uniqueValuesArray.length) * 100) / 3).toFixed(0);
    //                   setPercentage(per);
    //                   setTotalData(uniqueValuesArray.length); setSavedData(count++);
    //                 } else alert('Something went worng...');
    //               }
    //             );
    //           });
    //         });
    //       });//read file end
    //       console.log('........................END...................');
    //     });
    // });
    // storeBibleKeyWords();
  }
  const storeBibleKeyWords = async () => {
    setIsStore(true);
    await db.transaction(function (txn) {
      txn.executeSql(
        "SELECT * FROM Bible1",
        [],
        function (tx, res) {
          var temp = [];
          var len = res.rows.length;
          if (len > 0) {
            for (let i = 0; i < len; ++i)
              temp.push(res.rows.item(i));
            if (res.rows.item(len - 1).Keywords == undefined) {
              console.log('column not found');
              txn.executeSql("Alter table Bible1 Add Column Keywords TEXT", [])
              console.log('coulmn added...');
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
                      'UPDATE Bible1 set Keywords=? where Id=?',
                      [uniqueValues, element.Id],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          let per = (((element.Id / temp.length) * 100) / 3).toFixed(0);
                          setPercentage((per * 3) + 1);
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
              setIsStore(false);
            }
          }
        }
      );
    });



    // setIsStore(false); setModalVisible(true);
    // console.log('storing bible');
    // await db.transaction((tx) => {
    //   tx.executeSql(
    //     'SELECT * FROM Bible1',
    //     [],
    //     (tx, results) => {
    //       var temp = [];
    //       var len = results.rows.length;
    //       if (len > 0) {
    //         for (let i = 0; i < len; ++i)
    //           temp.push(results.rows.item(i));
    //       }
    //       let data = []; let finalArray = [];
    //       RNFS.readFileAssets('list of stop words.txt', 'ascii').then((res) => {
    //         var newData = res.split(/\r?\n/);
    //         temp.forEach((element, i) => {
    //           var e = JSON.stringify(element.VerseText);
    //           var originalStr = "" + JSON.parse(e);
    //           var removeSpaces = originalStr.replace(/^\s+|\s+$/gm, '');//remove whitespaces from start and end of string.
    //           var removeExtraSymbols = removeSpaces.replace(/,|;|:|\?|\.|([()])/g, '');
    //           var wordsArray = removeExtraSymbols.split(' ');
    //           let newStringArray1 = sw.removeStopwords(wordsArray);
    //           newStringArray1.forEach((word, index) => {
    //             if (word.length == 0) {
    //               newStringArray1.splice(index, 1)//remove empty element("") from array
    //               index--;
    //             } else {
    //               newData.forEach(stopWord => {
    //                 if (word.toLocaleLowerCase() == stopWord.toLocaleLowerCase()) {
    //                   newStringArray1.splice(index, 1)//remove matching word
    //                   index--;
    //                 }
    //               });
    //             }
    //           });
    //           var value0 = newStringArray1.join(',');
    //           let obj = {};
    //           obj.Id = element.Id,
    //             obj.ChapterNo = element.ChapterNo,
    //             obj.VerseNo = element.VerseNo,
    //             obj.VerseText = element.VerseText,
    //             obj.After = value0
    //           finalArray.push(obj);
    //         });//temp end
    //         let uniqueValuesArray = [];
    //         finalArray.forEach((element, i) => {
    //           let arr = String(element.After).replace(/,$/, '').split(',');
    //           let uniqueValues = [...new Set(arr)].join(',');
    //           let obj = {};
    //           obj.Id = element.Id,
    //             obj.ChapterNo = element.ChapterNo,
    //             obj.VerseNo = element.VerseNo,
    //             obj.VerseText = element.VerseText,
    //             obj.After = uniqueValues,
    //             uniqueValuesArray.push(obj);
    //         });
    //         let count = 1;
    //         uniqueValuesArray.forEach(stopWord => {
    //           tx.executeSql(
    //             'INSERT INTO StopWords (TextId,Keywords,BookName ) VALUES (?,?,?)',
    //             [stopWord.Id, stopWord.After, 'Bible'],
    //             (tx, results) => {
    //               console.log('Inserted Id ', results.insertId);
    //               if (results.rowsAffected > 0) {
    //                 let per = (((results.insertId / uniqueValuesArray.length) * 100) / 3).toFixed(0);
    //                 setPercentage(per);
    //                 setTotalData(uniqueValuesArray.length); setSavedData(count++);
    //               } else alert('Something went worng...');
    //             }
    //           );
    //         });
    //       });//read file end
    //       console.log('........................END...................');
    //     });
    //   getKeywordsAndStoreSynonyms();
    // });
  }

  useEffect(async () => {
    // setIsStore(true);
    // console.log('.............start...............');
    // await storeQuranKeyWords();
    // await storeHadeesKeyWords();
    // await storeBibleKeyWords();
    // console.log('.............end...............');
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
    console.log('else executed');
    setSearchArray(data => [...data, { Syn: text }]);
    await db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${tableName} WHERE AyatText like '${text} %' or AyatText like'% ${text}' or AyatText like'% ${text} %' or AyatText like '${text}' or AyatText REGEXP ' ${text}(,|;|.?") ' or AyatText REGEXP ' (,|;|.?")${text} '`,
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
            setIsFetched(false);
            alert("No record Found...")
          }
          // if (rowsLength < 50) {
          //   for (let i = 0; i < results.rows.length; ++i)
          //     temp.push(results.rows.item(i));
          // } else {
          //   for (let i = 0; i < 50; ++i)
          //     temp.push(results.rows.item(i));
          // }
          // if (rowsLength > 0) {
          //   temp.forEach(element => {
          //     setData(data => [...data,
          //     {
          //       Id: element.Id,
          //       SurahId: element.SurahId,
          //       AyatId: element.AyatId,
          //       AyatText: element.AyatText,
          //       SearchWord: text,
          //     }
          //     ]);
          //   });
          //   setIsFetched(false);
          // } else {
          //   setIsFetched(false);
          //   alert("No record Found...")
          // }
        });
    });
  }
  const getHadeesData = async (text, tableName) => {
    setSearchArray([]); setDataCopy([]); setNumOfIteration(0);
    setSearchArray(data => [...data, { Syn: text }]);
    // `SELECT * FROM ${tableName} WHERE HadeesText like '%${text}%'`,
    await db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${tableName} WHERE HadeesText like '${text} %' or HadeesText like'% ${text}' or HadeesText like'% ${text} %' or HadeesText like '${text}' or HadeesText REGEXP ' ${text}(,|;|.?") ' or HadeesText REGEXP ' (,|;|.?")${text} ' `,
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
            setIsFetched(false);
            alert('No record found');
          }
          // var temp = [];
          // let rowsLength = results.rows.length;
          // console.log(rowsLength);
          // if (rowsLength < 100) {
          //   for (let i = 0; i < results.rows.length; ++i)
          //     temp.push(results.rows.item(i));
          // } else {
          //   for (let i = 0; i < 100; ++i)
          //     temp.push(results.rows.item(i));
          // }
          // if (rowsLength > 0) {
          //   temp.forEach(element => {
          //     setData(data => [...data,
          //     {
          //       Id: element.Id,
          //       JildNo: element.JildNo,
          //       HadeesNo: element.HadeesNo,
          //       NarratedBy: element.NarratedBy,
          //       HadeesText: element.HadeesText,
          //       SearchWord: text,
          //     }
          //     ]);
          //   });
          //   setIsFetched(false);
          // } else {
          //   setIsFetched(false);
          //   alert("No record Found...")
          // }
        });
    })
  }
  const getBibleData = async (text, tableName) => {
    setSearchArray([]); setDataCopy([]); setNumOfIteration(0);
    setSearchArray(data => [...data, { Syn: text }]);
    await db.transaction((tx) => {
      // `SELECT * FROM ${tableName} Where VerseText like '%${text}%'`,
      tx.executeSql(
        `SELECT * FROM ${tableName} JOIN BibleBooks on Bible1.BookId=BibleBooks.Id WHERE VerseText like '${text} %' or VerseText like'% ${text}' or VerseText like'% ${text} %' or VerseText like '${text}' or VerseText REGEXP ' ${text}(,|;|.?") ' or VerseText REGEXP ' (,|;|.?")${text} ' `,
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
            setIsFetched(false);
            alert('No record found');
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
  const ListHeader = ({ resultLength }) => {
    return (
      <View style={{ backgroundColor: '#eee', padding: 10 }}>
        <Text style={{ marginLeft: 10, color: '#555' }}>{resultLength} Results</Text>
        <View style={{ borderBottomColor: '#555', borderBottomWidth: 1, marginTop: 10 }}></View>
      </View>
    );
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
            <View style={{ padding: 10, backgroundColor: '#28D6C0', borderBottomColor: '#222', borderBottomWidth: 2, marginBottom: 10, }}>
              <View style={styles.searchBar}>
                <TextInput
                  style={{ flex: 1,color:'#000' }}
                  onChangeText={(text) => setSearch(text)}
                  placeholder={'search here...'} placeholderTextColor={'gray'} />
                <Icon name='search' color={'#fff'} size={30}
                  onPress={() => searchResult(search, tableName)}
                  style={{ backgroundColor: '#28D6C0', width: 50, textAlign: 'center' }} />
                {/* <TouchableOpacity onPress={() => searchResult(search, tableName)}
                  style={{ height: 40, backgroundColor: '#015c92',flex:.5, borderRadius: 10, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center' }}>Search</Text>
                </TouchableOpacity> */}
              </View>

              <View style={{ paddingVertical: 10, flexDirection: 'row' }}>
                {/* <Text style={{ fontSize: 18 }}>Search In:</Text> */}
                <RadioForm style={{ flex: 1, justifyContent: 'space-evenly' }}
                  radio_props={radio_props}
                  initial={0}
                  formHorizontal={true}
                  buttonColor={'#000'}
                  buttonOuterSize={25}
                  selectedButtonColor={"#555"}
                  selectedLabelColor={"#fff"}
                  labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                  onPress={(value) => setTableName(value)}
                />
              </View>
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
                    // ListHeaderComponent={<ListHeader resultLength={data.length} />}
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
                        style={styles.card}>
                        <Text style={{ color: 'green', fontWeight: 'bold', paddingVertical: 10, fontSize: 12 }} >Surah No {item.item.SurahId} , Ayat No {item.item.AyatId}</Text>
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
                          BookName: item.item.BookName,
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

export default Search;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // padding: 10,
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    height: 40,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#444',
    // borderRadius: 70,
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 10
  },
  card: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    marginBottom: 17,
    justifyContent: 'center',
    backgroundColor: '#ccc'
  }
})