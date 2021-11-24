import React, { useState, useEffect, } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Highlighter from 'react-native-highlight-words';
const Search = () => {
  var db = openDatabase({ name: 'hadees.db', createFromLocation: 1 });
  const [search, setSearch] = useState('');
  const [searchArray, setSearchArray] = useState([]);
  const [data, setData] = useState([]);
  const [dataCopy, setDataCopy] = useState([]);
  useEffect(() => {
    setData('');
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Hadees',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          let count = 0;
          temp.forEach(element => {
            setData(data => [...data,
            {
              Count: ++count,
              HID: element.HID,
              TID: element.TID,
              HArabicText: element.HArabicText,
              HEnglish: element.HEnglish,
              HUrduText: element.HUrduText,
              HRefrence: element.HRefrence,
              Favorite: element.Favorite,
            }
            ]);
            setDataCopy(data => [...data,
            {
              Count: ++count,
              HID: element.HID,
              TID: element.TID,
              HArabicText: element.HArabicText,
              HEnglish: element.HEnglish,
              HUrduText: element.HUrduText,
              HRefrence: element.HRefrence,
              Favorite: element.Favorite,
            }
            ]);
          });
        });
    });
  }, []);
  const searchWord = (text) => {
    console.log(text);
    setSearchArray('');
    let newFilterData = [];
    if (text) {
      newFilterData = data.filter(function (item) {
        return item.HEnglish.toString().toLowerCase().includes(text.toLowerCase());
      });
      setData(newFilterData);
    
    }else{
      setData(dataCopy);
    }
    setSearchArray(text);
    setSearch(text);
  }
  return (

    <View style={styles.container}>
      <TextInput style={styles.input} onChangeText={(text) => searchWord(text)} placeholder={'search here...'} placeholderTextColor={'gray'} />
      <FlatList
        data={data}
        keyExtractor={(item, index) => index}
        renderItem={(item, index) =>
          <View
            style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
            <Highlighter style={styles.text}
              highlightStyle={{ backgroundColor: '#ffa200' }}
              searchWords={[searchArray]}
              textToHighlight={item.item.HEnglish}
            />
          </View>
        }
      />
    </View>
  );
}

export default Search;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 10,
  },
  input: {
    margin: 5,
    width: '100%',
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