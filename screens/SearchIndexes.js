import React, { useState, useEffect, } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Highlighter from 'react-native-highlight-words';
const SearchIndexes = () => {
    var db = openDatabase({ name: 'HolyQuran.db', createFromLocation: 1 });
    const [search, setSearch] = useState('');
    const [searchArray, setSearchArray] = useState([]);
    const [data, setData] = useState([]);
    const [dataCopy, setDataCopy] = useState([]);
    const searchResult = (text) => {
        console.log('searchResult ', text);
        setData('');
        setSearch(text);
        if (text) {
            db.transaction((tx) => {
                tx.executeSql(
                    `SELECT * FROM AyatEnglish Where Adjectives like '%${text}%'`,
                    [],
                    (tx, results) => {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        console.log(temp);
                        temp.forEach(element => {
                            setData(data => [...data,
                            {
                                Id: element.Id,
                                SurahId: element.SurahId,
                                AyatId: element.AyatId,
                                AyatText: element.AyatText,
                            }
                            ]);
                        });
                    });
            });
        } else {
            setData('');
        }
    }
    return (

        <View style={styles.container}>
            <TextInput style={styles.input} onChangeText={(text) => searchResult(text)} placeholder={'search here...'} placeholderTextColor={'gray'} />
            <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={(item, index) =>
                    <View style={{flex: 1, width: '97%', alignSelf: 'center',padding:10 ,borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                    <View
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        {/* <Highlighter style={styles.text}
              highlightStyle={{ backgroundColor: '#ffa200' }}
              searchWords={[searchArray]}
              textToHighlight={item.item.HEnglish}
            /> */}
                        <Text style={{fontSize:20,color:'green'}}>Suran No {item.item.SurahId},</Text>
                        <Text style={{fontSize:20,color:'green'}}>Ayat No {item.item.AyatId}</Text>
                    </View>
                        <Text style={{fontSize:18,}}>{item.item.AyatText}</Text>
                    </View>
                }
            />
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