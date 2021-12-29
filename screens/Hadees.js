import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
export default function Hadees({ navigation, route }) {
    const [data, setData] = useState([]);
    const [isFetched, setisFetched] = useState(true)
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    useEffect(() => {
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Hadees',
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < 50; ++i)
                            temp.push(results.rows.item(i));
                    }
                    temp.forEach(element => {
                        setData(data => [...data,
                        {
                            Id: element.Id,
                            JildNo: element.JildNo,
                            HadeesNo: element.HadeesNo,
                            NarratedBy: element.NarratedBy,
                            HadeesText: element.HadeesText,
                        }
                        ]);
                    });
                    setisFetched(false);
                });
        });
    }, []);
    return (
        <View style={{
            padding: 10, flex: 1, backgroundColor: '#fff'
        }}>

            {
                isFetched == true ? (
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
                                <Text style={{ fontSize: 20, }}>JildNo : {item.item.JildNo}</Text>
                                <Text style={{ fontSize: 20, }}>HadeesNo : {item.item.HadeesNo}</Text>
                                <Text style={{ fontSize: 20, }}>NarratedBy : {item.item.NarratedBy}</Text>
                                <Text style={{ fontSize: 20, }}>HadeesText : {item.item.HadeesText}</Text>
                            </View>
                        }
                    />
                )
            }
        </View>
    );
}
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
})