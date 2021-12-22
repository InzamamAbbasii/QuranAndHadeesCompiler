import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, LogBox, ScrollView, FlatList } from "react-native";
// Import File Viewer to View Files in Native File Viewer
import FileViewer from 'react-native-file-viewer';
// Import DocumentPicker to pick file to view
import DocumentPicker from 'react-native-document-picker'

var RNFS = require('react-native-fs');

const sw = require('remove-stopwords');
import { openDatabase } from 'react-native-sqlite-storage';

const ReadFile = ({ navigation, route }) => {
  var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
  // LogBox.ignoreAllLogs();
  // console.log(route.params.data1);
  const [data, setData] = useState('Empty');

  //   useEffect(() => {
  //  //  TODO : Read only .txt files
  //  RNFS.readFileAssets('ALHADITH.txt').then((res) => {
  //   console.log('read file res: ', res);
  //   // const oldString = res.split(' ')
  //   // console.log(oldString);
  //   // const newStringArray = sw.removeStopwords(oldString);
  //   // let newString = newStringArray.toString().split(',').join(' ');
  //   // setData(newString);
  //     setData(res);
  //   // db.transaction((tx) => {
  //   //   tx.executeSql(
  //   //     'SELECT * FROM FilesDetail where FileName=?',
  //   //     ['1.txt'],
  //   //     (tx, results) => {
  //   //       var temp = [];
  //   //       console.log('.............', results.rows.length);
  //   //       if (results.rows.length == 0) {//check record if it exist or not
  //   //         console.log('----------ready to store data-----------');
  //   //         //store value to database
  //   //         db.transaction(function (tx) {
  //   //           tx.executeSql(
  //   //             'INSERT INTO FilesDetail (FileName,FileText) VALUES (?,?)',
  //   //             ['1.txt',newString],
  //   //             (tx, results) => {
  //   //               console.log('Results', results.rowsAffected);
  //   //               if (results.rowsAffected > 0) {
  //   //                 Alert.alert('Data Inserted Successfully....');
  //   //               } else Alert.alert('Failed....');
  //   //             }
  //   //           );
  //   //         });
  //   //         //end store data
  //   //         console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;');
  //   //         for (let i = 0; i < results.rows.length; ++i)
  //   //           temp.push(results.rows.item(i));
  //   //         console.log(temp);
  //   //       }

  //   //     }
  //   //   );
  //   // });

  // }).catch((err) => {
  //   console.log(err.message, err.code);
  // });



  //   }, [])
  const selectOneFile = async () => {

    // RNFS.readFileAssets('1.txt') // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
    // .then((result) => {
    //   console.log('GOT RESULT', result);

    //   // stat the first file
    //   return Promise.all([RNFS.stat(result[0].path), result[0].path]);
    // })
    // .then((statResult) => {
    //   if (statResult[0].isFile()) {
    //     // if we have a file, read it
    //     return RNFS.readFile(statResult[1], c);
    //   }    
    //   return 'no file';
    // })
    // .then((contents) => {
    //   // log the file contents
    //   console.log(contents);
    // })
    // .catch((err) => {
    //   console.log(err.message, err.code);
    // });

    // To Select File
    //   try {
    //     const res = await DocumentPicker.pick({
    //       // Provide which type of file you want user to pick
    //       type: [DocumentPicker.types.allFiles],
    //       // There can me more options as well
    //       // DocumentPicker.types.allFiles
    //       // DocumentPicker.types.images
    //       // DocumentPicker.types.plainText
    //       // DocumentPicker.types.audio
    //       // DocumentPicker.types.pdf
    //     });
    //     console.clear();
    //     console.log('res',res);
    //     console.log('res URI..',res[0].uri);
    //     if (res) {
    //       let uri = res[0].uri;
    //       if (Platform.OS === 'ios') {
    //         // Remove 'file://' from file path for FileViewer
    //         uri = res.uri.replace('file://', '');
    //       }
    //       console.log('URI : ' + uri);
    //       FileViewer.open(uri)
    //         .then((data) => {
    //           // Do whatever you want
    //           console.log('Success',data);
    //             RNFS.readFile(uri).then((res) => {
    //             console.log('read file res: ', res);
    //           }).catch((err) => {
    //               console.log(err.message, err.code);
    //             });
    //         })
    //         .catch(_err => {
    //           // Do whatever you want
    //           console.log(_err);
    //         });
    //     }
    //   } catch (err) {
    //     // Handling Exception
    //     if (DocumentPicker.isCancel(err)) {
    //       // If user canceled the document selection
    //       alert('Canceled');
    //     } else {
    //       // For Unknown Error
    //       alert('Unknown Error: ' + JSON.stringify(err));
    //       throw err;
    //     }
    //   }
  };
  return (
    <ScrollView style={styles.mainBody}>
      <View style={{ alignItems: 'center' }}>
        {/* <Text style={{ fontSize: 28 }}>{data}</Text> */}
        <Text style={{ fontSize: 28 }}>{route.params.data1}</Text>
        {/* <FlatList
          data={route.params.data1}
          renderItem={({ item, index }) => (
            <Text>{item} </Text>
          )}
        /> */}
        <Text>End----</Text>

      </View>
      {/* <TouchableOpacity
        style={styles.buttonStyle}
        activeOpacity={0.5}
        onPress={selectOneFile}>
        <Text style={styles.buttonTextStyle}>
          Read File
        </Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
}
export default ReadFile;
const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    padding: 20,
  },
  buttonStyle: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
    marginBottom: 45,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
});