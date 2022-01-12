import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, LogBox, ScrollView } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const BibleChapterList = ({ navigation, route }) => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    const [data, setData] = useState([]);
    const [isFetched, setIsFetched] = useState(true);
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });

    const getChapterList = () => {
        console.log('get surah numbers ');
        setData('');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT ChapterNo,count(ChapterNo) as TotalVerses,BookId FROM Bible1 WHERE BookId=? GROUP By ChapterNo',
                [route.params.BookId],
                (tx, results) => {
                    var temp = [];
                    var len = results.rows.length;
                    if (len > 0) {
                        for (let i = 0; i < len; ++i)
                            temp.push(results.rows.item(i));
                        temp.forEach(element => {
                            setData(data => [...data, { ChapterNo: element.ChapterNo, TotalVerses: element.TotalVerses,BookId:element.BookId }]);
                        });
                    } else {
                        alert('No Record Found')
                    }
                    setIsFetched(false);
                });
        });
    }
    useEffect(() => {
        getChapterList();
    }, []);
    return (
        <View style={styles.container}>
            {isFetched == true ? (
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : (
                <View>
                <Text style={{textAlign:'right',marginRight:15,color:'#999696'}}>Total Verses </Text>
                <FlatList showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={(item, index) => index}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    renderItem={(item, index) =>
                        <TouchableOpacity onPress={()=>navigation.navigate('Bible',{ChapterNo:item.item.ChapterNo,BookId:item.item.BookId})} style={styles.button}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.buttonText,{textAlign:'left'}]} >Chapter No {item.item.ChapterNo}</Text>
                                <Text style={[styles.buttonText,{textAlign:'right'}]} >{item.item.TotalVerses}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
                </View>
            )
            }
        </View>
    );
}

export default BibleChapterList;
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
