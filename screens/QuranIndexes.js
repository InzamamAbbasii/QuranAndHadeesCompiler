import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import { openDatabase } from 'react-native-sqlite-storage';
import KeepAwake from 'react-native-keep-awake';
import IModal from '../src/components/IModal';
import CongratsAlert from '../src/components/CongratsAlert';
export default QuranIndexes = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [isStore, setIsStore] = useState(true);
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
      await storeQuranKeyWords();
      console.log('Quran Screen is focused');
    });
    await getQuranKeyWords();
    return unsubscribe;

    // Return the function to unsubscribe from the event so it gets removed on unmount
  }, []);

  const storeQuranKeyWords = async () => {
    console.log('metthod called');
    await db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='QuranKeywords'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            setModalVisible(true);
            // TODO:if table is not created it will create new table otherwise it will do nothing.
            txn.executeSql('DROP TABLE IF EXISTS QuranKeywords', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS QuranKeywords(Id INTEGER PRIMARY KEY AUTOINCREMENT,SurahId INT,AyatId INT,Keywords TEXT,BookName TEXT)',
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
                    let count=1;
                    temp.forEach(async(element, i) => {
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
                      // var value0 = newStringArray1.join(',');
                      // let obj = {};
                      // obj.Id = element.Id,
                      //   obj.SurahId = element.SurahId,
                      //   obj.AyatId = element.AyatId,
                      //   obj.AyatText = element.AyatText,
                      //   obj.After = value0,
                        
                        // console.log(newStringArray1);
                        var uniqueWords = [...new Set(newStringArray1)];
                        uniqueWords.forEach(keyword => {
                          db.transaction(function (tx) {
                            tx.executeSql(
                              'INSERT INTO QuranKeywords (SurahId,AyatId,Keywords,BookName) VALUES (?,?,?,?)',
                              [element.SurahId,element.AyatId,keyword, 'Quran'],
                              (tx, results) => {
                                if (results.rowsAffected > 0) {
                                      console.log(element.SurahId,element.AyatId,keyword);
                                      let per = (((i+1)/ temp.length) * 100).toFixed(0);
                                      setPercentage(per);
                                      setTotalData(temp.length); setSavedData((i+1));
                                      console.log('Inserted Id ', results.insertId, per);
                                    } else alert('Something went worng...');
                                  }
                                );
                              });
                        });
                        
                        // console.log(obj);
                        // finalArray.push(obj);
                    });//temp end
                    // let uniqueValuesArray = [];
                    // finalArray.forEach((element, i) => {
                    //   let arr = String(element.After).replace(/,$/, '').split(',');
                    //   let uniqueValues = [...new Set(arr)].join(',');
                    //   console.log(uniqueValues);
                    //   let obj = {};
                    //   obj.Id = element.Id,
                    //     obj.SurahId = element.SurahId,
                    //     obj.AyatId = element.AyatId,
                    //     obj.AyatText = element.AyatText,
                    //     obj.After = uniqueValues,
                    //     uniqueValuesArray.push(obj);
                    // });
                    // uniqueValuesArray.forEach(stopWord => {
                    //   db.transaction(function (tx) {
                    //     tx.executeSql(
                    //       'INSERT INTO StopWords (TextId, Keywords,BookName) VALUES (?,?,?)',
                    //       [stopWord.Id, stopWord.After, 'Quran'],
                    //       (tx, results) => {
                    //         if (results.rowsAffected > 0) {
                    //           let per = ((results.insertId / uniqueValuesArray.length) * 100).toFixed(0);
                    //           setPercentage(per);
                    //           setTotalData(uniqueValuesArray.length); setSavedData(results.insertId);
                    //           console.log('Inserted Id ', results.insertId, per);
                    //           console.log('Data Stored Successfully!');
                    //         } else alert('Something went worng...');
                    //       }
                    //     );
                    //   });
                    // });
                  });//read file end
                });
            });
    //         // ------------------------------------------------
            console.log('........................END Storing Quran KeyWords...................');
          } else {
            console.log('Do nothing in Quran Screen..');
            //   navigation.navigate('Quran');
            // storeHadeesKeyWords();
            setIsStore(false);
          }
        }
      );
    });
  }
  const getQuranKeyWords = async () => {
    setData([]); setIsFetched(true);
    //read keywords from Quran_KeyWords
    await db.transaction(function (txn) {
      txn.executeSql(
        "SELECT * FROM QuranKeyWords",
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
              SurahId: element.SurahId,
              AyatId: element.AyatId,
              Keywords: element.Keywords,
            }
            ]);
          });
        }
          setIsFetched(false);
        });
    });
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'#000' }}>
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
          <View style={{width:'100%',height:'100%',padding:15,backgroundColor:'#58c7be'}}>
          <FlatList showsVerticalScrollIndicator={false} 
            data={data}
            keyExtractor={(item, index) => index}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            // removeClippedSubviews={true}
            // legacyImplementation={true}
            ListHeaderComponent={ <Text style={{fontSize:24,fontWeight:'bold',textAlign:'center'}}>Indexes</Text>}
            renderItem={(item, index) =>
              <View
                style={{backgroundColor: '#58c7be', }}>
                {/* <Text style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#58c7be', paddingVertical: 10, fontSize: 20 }} >Surah No {item.item.SurahId} : Ayat No {item.item.AyatId}</Text> */}
                <Text style={{ fontSize: 23, color: '#222' }}>{item.item.Keywords}({item.item.SurahId},{item.item.AyatId})</Text>
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