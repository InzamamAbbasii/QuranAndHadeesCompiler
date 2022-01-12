import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import CircularProgress from 'react-native-circular-progress-indicator';
var RNFS = require('react-native-fs');
const Bible = ({ navigation,route }) => {
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    const [percentage, setPercentage] = useState(0);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const storeBibleData = async () => {
        console.log('read Bible...');
        try {
            await db.transaction(function (txn) {
                txn.executeSql(
                  "SELECT name FROM sqlite_master WHERE type='table' AND name='Bible1'",
                  [],
                  function (tx, res) {
                      console.log('rows : ',res.rows.length);
                    if (res.rows.length == 0) {
                      // TODO:if table is not created it will create new table otherwise it will do nothing.
                      txn.executeSql('DROP TABLE IF EXISTS Bible1', []);
                      txn.executeSql(
                        'CREATE TABLE IF NOT EXISTS Bible1(Id INTEGER PRIMARY KEY AUTOINCREMENT, ChapterNo INT, VerseNo INT, VerseText TEXT)',
                        []
                      );

                      // TODO;read data from file and store into database
                      RNFS.readFileAssets('Bible King James 5.txt', 'ascii').then((res) => {
                        // console.log('..................................');
                        let newFile = res.split('\n');
                        let startingIndex = 0;
                        for (let index = 0; index < newFile.length; index++) {
                          const element = newFile[index];
                          // console.log(element);
                          if (element.match('1:1')) {
                            startingIndex = index;
                            break;
                          }
                        }
                        let bibleData = [];
                        for (let index = startingIndex; index < newFile.length - 7; index++) {
                          const element = newFile[index];
                          if (newFile[index].length > 1) {//TODO:Check if line has no  string
                            if (element.match(/^\d/)) {
                              // Return true if new line start with any numeric value
                              bibleData.push(element);
                            } else {
                              let i = bibleData.length - 1;
                              let newText = JSON.stringify(element);
                              let oldText = JSON.stringify(bibleData[i]);
                              let str = '';
                              str = oldText.concat(' ', newText);
                              let finalStr = str.replace(/\\r|"/g, '');
                              bibleData.pop();
                              bibleData.push(finalStr);
                            }
                          }
                        }
                        let bibleWords = [];
                        for (let i = 0; i < bibleData.length; i++) {
                          let ele = bibleData[i];
                          let newElement = ele.split(' ');
                          let [first, ...second] = ele.split(" ");
                          second = second.join(" ");
                          let [chapter, verse] = first.split(':');
                          let obj = {};//chapter 1 verses 1
                          obj.Chapter = chapter;
                          obj.Verse = verse;
                          obj.Text = second;
                          bibleWords.push(obj);
                        }
                        bibleWords.forEach((element, index) => {
                          // console.log(element.Chapter, element.Verse, element.Text);
                          // TODO:Store file data to database
                            db.transaction(function (tx) {
                            tx.executeSql(
                              'INSERT INTO Bible1 (ChapterNo, VerseNo, VerseText) VALUES (?,?,?)',
                              [element.Chapter, element.Verse, element.Text],
                              (tx, results) => {
                                if (results.rowsAffected > 0) {
                                  let per = ((results.insertId / bibleWords.length) * 100).toFixed(0);
                                  setPercentage(per);
                                  console.log(`${per}% Data Stored Successfully! , Inserted ID : ${results.insertId}`);
                                } else alert('Something went worng...');
                              }
                            );
                          });
                          // ............END OF STORING DATA TO DATABASE.............
                        });
                        getBibleData();
                      });
                      // ------------------------------------------------
                    } else {
                      console.log('Do nothing going to next screen..');
                      getBibleData();
                    }
                  }
                );
              });
        } catch (error) {
            console.log(error);
        }

      }
    const getBibleData=async()=>{
        setData('');
        console.log('get bible data........');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT *FROM Bible1 WHERE ChapterNo=? And BookId=?',
                [route.params.ChapterNo,route.params.BookId],
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
                            ChapterNo: element.ChapterNo,
                            VerseNo: element.VerseNo,
                            VerseText: element.VerseText,
                        }
                        ]);
                    });
                    setIsFetched(false);
                });
        });
    }
    useEffect(async() => {
        console.log('.........................................');
      //  await storeBibleData();
      getBibleData();
    }, []);
    return (
        <View style={styles.container}>
            {isFetched == true ? (
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
                <FlatList showsVerticalScrollIndicator={false} style={{padding:10}}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <View
                            style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 10, padding: 10, backgroundColor: '#58c7be' }}>
                            <Text style={{ color: '#000', fontWeight: 'bold', paddingVertical: 10,fontSize:20 }} >Chapter No {item.item.ChapterNo} : Verse No {item.item.VerseNo}</Text>

                            <Text style={{ color: '#222', fontSize: 20 }}>{item.item.VerseText}</Text>
                        </View>
                    }
                />
            )
            }
        </View>
    );
}

export default Bible;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
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
