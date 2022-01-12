import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, LogBox } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const JildList = ({ navigation, route }) => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });

    const getJildList = () => {
        console.log('get surah numbers ');
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT JildNo,Count(JildNo) as TotalHadees from Hadees WHERE HadeesText is not NULL GROUP By JildNo',
                [],
                (tx, results) => {
                    var temp = [];
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                        temp.forEach(element => {
                            setData(data => [...data, { JildNo: element.JildNo, TotalHadees: element.TotalHadees }]);
                        });
                    } else {
                        alert('No Record Found')
                    }
                    setIsFetched(false);
                });
        });
    }
    useEffect(() => {
        getJildList();
    }, []);
    return (
        <View style={styles.container}>
            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : (
                <FlatList showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <TouchableOpacity onPress={() => navigation.navigate('Hadees', { JildNo: item.item.JildNo })} style={styles.button}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.buttonText, { textAlign: 'left' }]} >Jild No {item.item.JildNo}</Text>
                                <Text style={[styles.buttonText, { textAlign: 'right' }]} >{item.item.TotalHadees}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
            )
            }
        </View>
    );
}
export default JildList;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    button: {
        flex: 1,
        width: '97%',
        backgroundColor: '#58c7be',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 8,
        elevation: 5,
        marginBottom: 10,
        padding: 10
    },
    buttonText: {
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        padding: 10,
        fontSize: 20,
    }
})
