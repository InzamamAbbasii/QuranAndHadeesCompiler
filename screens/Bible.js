import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const Bible = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    useEffect(() => {
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Bible1',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0 && len>150) {
                        for (let i = 0; i < 100; ++i)
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
    }, []);
    return (
        <View style={styles.container}>
            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index}
                    renderItem={(item, index) =>
                        <View
                            style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, marginBottom: 20, padding: 10, backgroundColor: '#fff' }}>
                            <Text style={{ color: '#3a53a6', fontSize: 20 }}>Id : {item.item.Id}</Text>
                            <Text style={{ color: '#3a53a6', fontSize: 20 }}>ChapterNo : {item.item.ChapterNo}</Text>
                            <Text style={{ color: '#3a53a6', fontSize: 20 }}>VerseNo : {item.item.VerseNo}</Text>
                            <Text style={{ color: '#3a53a6', fontSize: 20 }}>VerseText : {item.item.VerseText}</Text>
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
        backgroundColor: '#fff',
        padding: 10,
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
