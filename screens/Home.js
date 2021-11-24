import { NavigationContainer } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView,TouchableOpacity } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const Home = ({navigation}) => {
  var db = openDatabase({ name: 'ReadFile.db',createFromLocation:1 });
  useEffect(() => {
    console.log('useEffect...123');
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM FilesDetail',
        [],
        (tx, results) => {
          console.log(results);
          var temp = [];
          console.log('.............',results.rows.length);
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          console.log(temp);
        }
      );
    });
  }, []);
  return (
    <ScrollView style={styles.container}>
      <Text style={{fontWeight:'bold',color:'#3a53a6',fontSize:40}}>Quran And Hadees  </Text>
      <Text style={{fontWeight:'bold',color:'#3a53a6',fontSize:40,alignSelf:'center'}}>Compiler </Text>
       <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Quran </Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Hadees')}>
          <Text style={styles.buttonText}> Hadith </Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Bible </Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Thesaurus </Text>
       </TouchableOpacity>
       {/* <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Synonyms')}>
          <Text style={styles.buttonText}> Add Synonyms </Text>
       </TouchableOpacity> */}
       {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> Search Files </Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('SearchIndexes')}>
          <Text style={styles.buttonText}> Search Indexes </Text>
       </TouchableOpacity> */}
       {/* <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Search')}>
          <Text style={styles.buttonText}> Search </Text>
       </TouchableOpacity> */}
       <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ReadFile')}>
          <Text style={styles.buttonText}> Search </Text>
       </TouchableOpacity>
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
  button:{
    backgroundColor:'#3a53a6',
    marginBottom:13,
    height:50,
    width:'97%',
    alignItems:'center',
    alignSelf:'center',
    justifyContent:'center',
    borderRadius:30
  },
  buttonText:{
   color:'#fff',
   fontSize:20,
   fontWeight:'bold',
  }
})
