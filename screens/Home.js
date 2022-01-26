import React, { useState, useEffect } from "react";
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { openDatabase } from 'react-native-sqlite-storage';
import CongratsAlert from "../src/components/CongratsAlert";
var RNFS = require('react-native-fs');
import IModal from "../src/components/IModal";
const sw = require('remove-stopwords');
const Home = ({ navigation }) => {
  let Width = Dimensions.get('screen').width;
  let Height = Dimensions.get('screen').height;
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCongratsAlert, setShowCongratsAlert] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [savedData, setSavedData] = useState(0);

  var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
  const [ob1, setOb1] = useState([{ Id: '1', Name: 'Ali', A: 'A' }, { Id: '1', Name: 'Ali', A: 'A' }, { Id: '1', Name: 'Ali', A: 'A' }, { Id: '2', Name: 'Basit', A: 'B' }, { Id: '2', Name: 'Basit', A: 'B' }]);

  // useEffect(() => {
  //   const arrObjOne = [...new Map(ob1.map(item => [JSON.stringify(item), item])).values()];
  //   console.log(ob1.length, arrObjOne.length);
  // }, [])
  const ReadQuran = async () => {
    console.log('read Quran');
    try {
      await db.transaction(function (txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='Quran'",
          [],
          function (tx, res) {
            console.log('item:', res.rows.length);
            if (res.rows.length == 0) {
              setModalVisible(true);
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
                      str = oldText.concat(' ', newText);
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
                let per = 0;
                words.forEach((element, index) => {
                  // console.log(element.SurahId, element.AyatId, JSON.parse(element.AyatText));
                  // TODO:Store file data to database

                  db.transaction(function (tx) {
                    tx.executeSql(
                      'INSERT INTO Quran (SurahId, AyatId, AyatText) VALUES (?,?,?)',
                      [element.SurahId, element.AyatId, JSON.parse(element.AyatText)],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          per = ((results.insertId / words.length) * 100).toFixed(0);
                          setPercentage(per);
                          setTotalData(words.length); setSavedData(results.insertId);
                          // console.log(`${per}% Data Stored Successfully! , Inserted ID : ${results.insertId}`);
                        } else alert('Something went worng...');
                      }
                    );
                  });
                  // ............END OF STORING DATA TO DATABASE.............
                });
                //   navigation.navigate('Quran');

              });
              // alert('download completed');
              console.log('end storing Quran Data.');
              // ------------------------------------------------
            } else {
              console.log('Do nothing going to next screen..');
              navigation.navigate('SurahList');
            }
          }
        );
      });
    } catch (error) {
      alert(error)
    }
  }

  const ReadHadees = async () => {
    console.log('read Hadees...');
    try {
      await db.transaction(function (txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='Hadees'",
          [],
          function (tx, res) {
            console.log('item:', res.rows.length);
            if (res.rows.length == 0) {
              setModalVisible(true);
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
                  // console.log(element);
                  if (newFile[index].length > 1) {//TODO:Check if line has no  string
                    if (element.match(/^\d.[\s]*\d/)) { // \d means digit and \s means space
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
                  let [first, second, ...third] = ele.split(':');
                  let [jild, hadees] = first.split('.');
                  let obj = {};
                  obj.JildNo = jild;
                  obj.HadeesNo = hadees;
                  obj.NarratedBy = second;
                  //obj.HadeesText = third[0];
                  third.forEach((element, index) => {
                    if (index == 0) {
                      obj.HadeesText = element;
                    } else {
                      obj.HadeesText += ':' + element;
                    }
                  });
                  hadeesWords.push(obj);
                }
                hadeesWords.forEach((element, index) => {
                  // console.log('inside');
                  // console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');
                  // console.log(element);
                  // console.log(element.JildNo, element.HadeesNo, element.NarratedBy,element.HadeesText);
                  // TODO:Store file data to database

                  db.transaction(function (tx) {
                    tx.executeSql(
                      'INSERT INTO Hadees (JildNo, HadeesNo, NarratedBy,HadeesText) VALUES (?,?,?,?)',
                      [element.JildNo, element.HadeesNo, element.NarratedBy, element.HadeesText],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          let per = ((results.insertId / hadeesWords.length) * 100).toFixed(0);
                          setPercentage(per);
                          setTotalData(hadeesWords.length); setSavedData(results.insertId);
                        } else alert('Something went worng...');
                      }
                    );
                  }, error => { alert(error) })
                  // ............END OF STORING DATA TO DATABASE.............
                });
                //   navigation.navigate('Hadees');
                // getHadeesData();
              });
              // ------------------------------------------------
              console.log('....END storing Hadees........');
            } else {
              console.log('Do nothing going to next screen..');
              navigation.navigate('JildList');
              // getHadeesData();
            }
          }
        );
      });
    } catch (error) {
      alert(error)
    }
  }

  const ReadBible = async () => {
    console.log('read Bible...');
    try {
      await db.transaction(function (txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='Bible1'",
          [],
          function (tx, res) {
            console.log('rows : ', res.rows.length);
            if (res.rows.length == 0) {
              setModalVisible(true);
              // TODO:if table is not created it will create new table otherwise it will do nothing.
              txn.executeSql('DROP TABLE IF EXISTS Bible1', []); ``
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS Bible1(Id INTEGER PRIMARY KEY AUTOINCREMENT, ChapterNo INT, VerseNo INT, VerseText TEXT,BookId INT)',
                []
              );

              // TODO;read data from file and store into database
              RNFS.readFileAssets('Bible King James 5.txt', 'ascii').then((res) => {
                // console.log('..................................');
                let removeEmptyRow = res.replace(/[\r\n]+/g, '\n');
                let newFile = removeEmptyRow.split('\n');
                let startingIndex = 0;
                for (let index = 0; index < newFile.length; index++) {
                  const element = newFile[index];
                  // console.log(element);
                  if (element.match('The First Book of Moses:  Called Genesis')) {
                    startingIndex = index;
                    break;
                  }
                }
                // console.log(startingIndex);
                let bibleData = [];
                let bookofMoses = [];
                // let count=0;
                let count1 = 0;
                for (let index = startingIndex; index < newFile.length; index++) {//newFile.length - 7
                  const element = newFile[index];
                  if (newFile[index].length > 1) {//TODO:Check if line has no  string
                    if (newFile[index + 1].charAt(0).match('1') && newFile[index + 1].charAt(2).match('1') && newFile[index + 1].charAt(3).match(' ')) {
                      //to skip that row which contin book name
                    }
                    else {
                      if (element.match(/^\d/)) {
                        // Return true if new line start with any numeric value
                        bibleData.push(element);
                      } else {
                        let i = bibleData.length - 1;
                        let newText = JSON.stringify(element);
                        let oldText = JSON.stringify(bibleData[i]);
                        let str = '';
                        // console.log(newText, oldText);
                        str = oldText.concat(' ', newText);
                        let finalStr = str.replace(/\\r|"/g, '');
                        bibleData.pop();
                        bibleData.push(finalStr);
                      }
                    }
                  }
                  // }
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
                console.log('.............................');
                let count = 0;
                let bookId = 1;
                for (let index = 0; index < bibleWords.length; index++) {
                  const element = bibleWords[index];
                  // TODO:Store file data to database
                 
                  if (element.Chapter === '1' && element.Verse === '1') {
                    // console.log(index, ++count);
                    // console.log('if');
                    db.transaction((txx) => {
                      txx.executeSql(
                        'SELECT * from BibleBooks',
                        [],
                        (tx, results) => {
                          var len = results.rows.length;
                          if (len > 0) {
                            bookId = results.rows.item(count).Id;
                            count++;
                          } else { alert('Book not found.') }
                        });
                    });
                  }
                  // else {
                    db.transaction((txx) => {
                      txx.executeSql(
                        'INSERT INTO Bible1 (ChapterNo, VerseNo, VerseText,BookId) VALUES (?,?,?,?)',
                        [element.Chapter, element.Verse, element.Text, count.toString()],
                        (tx, results) => {
                          if (results.rowsAffected > 0) {
                            console.log(results.insertId,count,bookId);
                            let per = ((results.insertId / bibleWords.length) * 100).toFixed(0);
                            setPercentage(per);
                            setTotalData(bibleWords.length); setSavedData(results.insertId);
                          } else alert('Something went worng...');
                        }
                      );
                    });
                  // }

                }
                // bibleWords.forEach((element, index) => {
                //   // console.log(element.Chapter, element.Verse, element.Text);
                //   // TODO:Store file data to database
                //   if (element.Chapter === '1' && element.Verse === '1') {
                //     // console.log(index, ++count);
                //     tx.executeSql(
                //       'SELECT * from BibleBooks',
                //       [],
                //       (tx, results) => {
                //         var len = results.rows.length;
                //         if (len > 0) {
                //           bookId = results.rows.item(count).Id;
                //           console.log(results.rows.item(count).Id);
                //           count++;
                //         } else { alert('Book not found.') }
                //       });
                //   }
                //   tx.executeSql(
                //     'INSERT INTO Bible1 (ChapterNo, VerseNo, VerseText,BookId) VALUES (?,?,?,?)',
                //     [element.Chapter, element.Verse, element.Text, count],
                //     (tx, results) => {
                //       if (results.rowsAffected > 0) {
                //         let per = ((results.insertId / bibleWords.length) * 100).toFixed(0);
                //         setPercentage(per);
                //         setTotalData(bibleWords.length); setSavedData(results.insertId);
                //       } else alert('Something went worng...');
                //     }
                //   );
                //   // ............END OF STORING DATA TO DATABASE.............
                // });
                // getBibleData();
              });
              console.log('....End Storing Bible....');
              // ------------------------------------------------
            } else {
              console.log('Do nothing going to next screen..');
              // getBibleData();
              navigation.navigate('BibleBooksList');
            }
          }
        );
      });
    } catch (error) {
      alert(error.toString());
    }
  }

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
  return (
    <ScrollView style={styles.container}>
      <Text style={{ fontWeight: 'bold', color: '#0eab9e', fontSize: 40, textAlign: 'center', marginBottom: 20 }}>Quran,Hadees And Bible Compiler</Text>

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
      <View style={{ flexDirection: 'row', margin: 10}}>

        <TouchableOpacity style={{ flex: 1, margin: 5 }} onPress={() => ReadQuran()}>
          <Image
            source={require('../assets/images/Quran2.png')}
            style={styles.imageStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, margin: 5 }} onPress={() => ReadHadees()}>
          <Image
            source={require('../assets/images/Hadees1.png')}
            style={styles.imageStyle}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', margin: 10}}>

        <TouchableOpacity style={{ flex: 1, margin: 5 }} onPress={() => ReadBible()}>
          <Image
            source={require('../assets/images/bible-cover-B7MRKJ.jpg')}
            style={styles.imageStyle}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity style={{ flex: 1, margin: 5 }} onPress={() => navigation.navigate('IndexesTabs')}>
          <Image
            source={require('../assets/images/index.png')}
            style={styles.imageStyle}
          />
        </TouchableOpacity> */}

        
      </View>
      <View style={{ flexDirection: 'row', margin: 10, justifyContent: 'center' }}>

        <TouchableOpacity style={{ flex: 1, margin: 5 }}
          style={{
            backgroundColor: 'green', width: Dimensions.get('window').width / 2 - 30, height: Dimensions.get('window').width / 2 - 30,
            borderRadius: Dimensions.get('window').width / 2 - 30, justifyContent: 'center', alignItems: 'center'
          }}
          onPress={() => navigation.navigate('Search')}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{  backgroundColor: 'green', width: Dimensions.get('window').width / 2 - 30, height: Dimensions.get('window').width / 2 - 30,
            borderRadius: Dimensions.get('window').width / 2 - 30, justifyContent: 'center', alignItems: 'center',marginLeft:15}}
             onPress={() => navigation.navigate('SearchIndexes')}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>Indexes</Text>
          
        </TouchableOpacity>
        
      </View>

    </ScrollView>
  );
}

export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6b65e',
    padding: 10,
  },
  button: {
    backgroundColor: '#3a53a6',
    marginBottom: 13,
    height: 100,
    width: '97%',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 30
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  // button: {
  //   borderRadius: 20,
  //   padding: 10,
  //   elevation: 2
  // },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  imageStyle: {
    // padding: 10,
    // margin: 5,
    height: Dimensions.get('window').width / 2 - 30,
    width: Dimensions.get('window').width / 2 - 30,
    alignSelf: 'center',
    resizeMode: 'stretch',
  }
})

// chapter 1 verses 1
// Jild 1 hadees 1 