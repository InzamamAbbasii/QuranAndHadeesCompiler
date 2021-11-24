import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
export default function Hadees() {
    var db = openDatabase({ name: 'hadees.db', createFromLocation: 1 });
    const [data, setData] = useState([])
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
                    });
                });
        });
    }, []);
    return (
        <View>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={(item, index) =>
                    <View
                        style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, flexDirection: 'column', alignItems: 'center', marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                        {/* <Text style={{ fontSize: 20, }}>HID : {item.item.HID}</Text> */}
                        <Text style={{
                            fontSize: 20,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            padding: 10
                        }}> {item.item.HArabicText}</Text>
                        <Text style={{borderWidth:2,borderColor:'red',width:'95%',height:2}}></Text>
                        <Text style={{
                            fontSize: 20,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            padding: 10
                        }}> {item.item.HUrduText}</Text>
                    </View>
                }
            />
        </View>
    );
}