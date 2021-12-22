import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
var RNFS = require('react-native-fs');
const sw = require('remove-stopwords');
import { openDatabase } from 'react-native-sqlite-storage';
const Quran = ({ navigation, route }) => {
    const [data, setData] = useState([]);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    useEffect(() => {
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Quran',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if(len>0){
                        for (let i = 0; i <200; ++i)
                            temp.push(results.rows.item(i));
                    }
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
    }, []);

  
    return (
        <View style={styles.container}>

            <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={(item, index) =>
                    <View
                        style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 20,padding:10, backgroundColor: '#fff' }}>
                        <Text style={{ fontSize: 20, }}>SurahId : {item.item.SurahId}</Text>
                        <Text style={{ fontSize: 20, }}>AyatId : {item.item.AyatId}</Text>
                        <Text style={{ fontSize: 20, }}>AyatText : {item.item.AyatText}</Text>
                    </View>
                }
            />
        </View>
    );
}

export default Quran;
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
