import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
var RNFS = require('react-native-fs');

const sw = require('remove-stopwords');
const Home = ({ navigation }) => {
  const [data, setData] = useState([]);
  var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
  // useEffect(() => {
  //   console.log('useEffect...123');
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       'SELECT * FROM FilesDetail',
  //       [],
  //       (tx, results) => {
  //         console.log(results);
  //         var temp = [];
  //         console.log('.............',results.rows.length);
  //         for (let i = 0; i < results.rows.length; ++i)
  //           temp.push(results.rows.item(i));
  //         console.log(temp);
  //       }
  //     );
  //   });
  // }, []);
  const ReadFile = () => {
    //  TODO : Read only .txt files
    // RNFS.readFileAssets('ALHADITH.txt').then((res) => {
    // //  console.log('read file res: ', res);
    //   //  setData(res);

    RNFS.readFileAssets('1.txt').then((res) => {
      // console.log('read file res: ', res);
      const oldString = res.split(' ')
      // console.log(oldString);
      const newStringArray = sw.removeStopwords(oldString);
      let newString = newStringArray.toString().split('\n');
      // console.log(newString.A);
      console.log('..................................');
      // for (let index = 0; index < 10; index++) {
      //   const element = newString[index].split(':');
      //   console.log(element); 
      //   console.log('::::::::::::::::::::::');
      // }
      //  navigation.navigate('ReadFile',{data1:newString})
      // setData(newString);
      // setData(res);
      // db.transaction((tx) => {
      //   tx.executeSql(
      //     'SELECT * FROM FilesDetail where FileName=?',
      //     ['1.txt'],
      //     (tx, results) => {
      //       var temp = [];
      //       console.log('.............', results.rows.length);
      //       if (results.rows.length == 0) {//check record if it exist or not
      //         console.log('----------ready to store data-----------');
      //         //store value to database
      //         db.transaction(function (tx) {
      //           tx.executeSql(
      //             'INSERT INTO FilesDetail (FileName,FileText) VALUES (?,?)',
      //             ['1.txt',newString],
      //             (tx, results) => {
      //               console.log('Results', results.rowsAffected);
      //               if (results.rowsAffected > 0) {
      //                 Alert.alert('Data Inserted Successfully....');
      //               } else Alert.alert('Failed....');
      //             }
      //           );
      //         });
      //         //end store data
      //         console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;');
      //         for (let i = 0; i < results.rows.length; ++i)
      //           temp.push(results.rows.item(i));
      //         console.log(temp);
      //       }

      //     }
      //   );
      // });



    }).catch((err) => {
      console.log(err.message, err.code);
    });
  }

  const ReadQuran = () => {


    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Quran'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            // TODO:if table is not created it will create new table otherwise it will do nothing.
            txn.executeSql('DROP TABLE IF EXISTS Quran', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS Quran(Id INTEGER PRIMARY KEY AUTOINCREMENT, SurahId INT, AyatId INT, AyatText TEXT)',
              []
            );
            // TODO;read data from file and store into database
            RNFS.readFileAssets('PICKTHAL.TXT', 'ascii').then((res) => {
              console.log('..................................');
              let newFile = res.split('\n');
              let startingIndex = 0;
              for (let index = 0; index < newFile.length; index++) {
                const element = newFile[index];
                if (element.match('001')) {
                  startingIndex = index;
                  break;
                }
              }
              let data = [];
              for (let index = startingIndex; index < newFile.length; index++) {
                const element = newFile[index];
                if (newFile[index].length > 1) {
                  if (element.match(/^\d/)) {
                    // Return true
                    data.push(element);
                  } else {
                    let i = data.length - 1;
                    let newText = JSON.stringify(element);
                    let oldText = JSON.stringify(data[i]);
                    let str = '';
                    str = oldText.concat(newText);
                    let finalStr = str.replace(/\\r|"/g, '');
                    data.pop();
                    data.push(finalStr);
                  }
                }
              }
              let words = [];
              for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                let newElement = ele.split(' ');
                let [first, ...second] = ele.split(" ");
                let [surah, ayat] = first.split('.');
                second = second.join(" ")
                let obj = {};
                obj.SurahId = surah;
                obj.AyatId = ayat;
                obj.AyatText = JSON.stringify(second);
                words.push(obj);
              }
              words.forEach((element, index) => {
                // console.log(element.SurahId, element.AyatId, JSON.parse(element.AyatText));
                // TODO:Store file data to database
                db.transaction(function (tx) {
                  tx.executeSql(
                    'INSERT INTO Quran (SurahId, AyatId, AyatText) VALUES (?,?,?)',
                    [element.SurahId, element.AyatId, JSON.parse(element.AyatText)],
                    (tx, results) => {
                      console.log('Results', results.rowsAffected);
                      if (results.rowsAffected > 0) {
                        console.log('Data Stored Successfully!');
                      } else alert('Something went worng...');
                    }
                  );
                });
                // ............END OF STORING DATA TO DATABASE.............
              });
              navigation.navigate('Quran');
            });
            // ------------------------------------------------
          } else {
            console.log('Do nothing going to next screen..');
            navigation.navigate('Quran');
          }
        }
      );
    });



    console.log(';;;end;;;');
  }

  const ReadHadees = async () => {

    db.transaction(function (txn) {
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
                if (newFile[index].length > 1) {//TODO:Check if line has no  string
                  if (element.match(/^\d/)) {
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
                let [first,second,...third] = ele.split(':');
                let [jild,hadees] = first.split('.');
                let obj = {};
                obj.JildNo = jild;
                obj.HadeesNo = hadees;
                obj.NarratedBy = second;
                obj.HadeesText = third[0];
                hadeesWords.push(obj);
              }
              hadeesWords.forEach((element, index) => {
                // console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');
                // console.log(element.JildNo, element.HadeesNo, element.NarratedBy,element.HadeesText);
                // TODO:Store file data to database
                 db.transaction(function (tx) {
                  tx.executeSql(
                    'INSERT INTO Hadees (JildNo, HadeesNo, NarratedBy,HadeesText) VALUES (?,?,?,?)',
                    [element.JildNo, element.HadeesNo, element.NarratedBy,element.HadeesText],
                    (tx, results) => {
                      console.log('Inserted ID : ',results.insertId);
                      if (results.rowsAffected > 0) {
                        console.log('Data Stored Successfully!');
                      } else alert('Something went worng...');
                    }
                  );
                });
                // ............END OF STORING DATA TO DATABASE.............
              });
              navigation.navigate('Hadees');
              console.log('.........................END...........................');
            });
            // ------------------------------------------------
          } else {
            console.log('Do nothing going to next screen..');
            navigation.navigate('Hadees');
          }
        }
      );
    });
  }

  const ReadBible = async () => {

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Bible1'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            // TODO:if table is not created it will create new table otherwise it will do nothing.
            txn.executeSql('DROP TABLE IF EXISTS Bible1', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS Bible1(Id INTEGER PRIMARY KEY AUTOINCREMENT, ChapterNo INT, VerseNo INT, VerseText TEXT)',
              []
            );
            // TODO;read data from file and store into database
            RNFS.readFileAssets('Bible King James 5.txt', 'ascii').then((res) => {
              console.log('..................................');
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
              bibleWords.forEach(async (element, index) => {
                // console.log(element.Chapter, element.Verse, element.Text);
                // TODO:Store file data to database
                await db.transaction(function (tx) {
                  tx.executeSql(
                    'INSERT INTO Bible1 (ChapterNo, VerseNo, VerseText) VALUES (?,?,?)',
                    [element.Chapter, element.Verse, element.Text],
                    (tx, results) => {
                      console.log('Results', results.rowsAffected);
                      if (results.rowsAffected > 0) {
                        console.log('Data Stored Successfully!');
                      } else alert('Something went worng...');
                    }
                  );
                });
                // ............END OF STORING DATA TO DATABASE.............
              });
              navigation.navigate('Bible');
              console.log('.........................END...........................');
            });
            // ------------------------------------------------
          } else {
            console.log('Do nothing going to next screen..');
            navigation.navigate('Bible');
          }
        }
      );
    });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={{ fontWeight: 'bold', color: '#3a53a6', fontSize: 40 }}>Quran And Hadees  </Text>
      <Text style={{ fontWeight: 'bold', color: '#3a53a6', fontSize: 40, alignSelf: 'center' }}>Compiler </Text>
      <TouchableOpacity style={styles.button} onPress={() => ReadQuran()}>
        <Text style={styles.buttonText}> Quran </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => ReadHadees()}>
        <Text style={styles.buttonText}> Hadith </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => ReadBible()}>
        <Text style={styles.buttonText}> Bible </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Thesaurus </Text>
       </TouchableOpacity> */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Synonyms')}>
        <Text style={styles.buttonText}>  Synonyms </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Search Files </Text>
       </TouchableOpacity> */}
      {/* <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('SearchIndexes')}>
         <Text style={styles.buttonText}> Search  </Text>
        </TouchableOpacity> */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search')}>
        <Text style={styles.buttonText}> Search </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={()=>ReadFile()}>
          <Text style={styles.buttonText}> Read File </Text>
       </TouchableOpacity> */}
    </ScrollView>
  );
}

export default Home;
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