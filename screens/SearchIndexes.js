import React, { useState, useEffect, } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Highlighter from 'react-native-highlight-words';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
const SearchIndexes = ({ navigation }) => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    const [search, setSearch] = useState('');
    const [tableName, setTableName] = useState('Quran');
    const [searchArray, setSearchArray] = useState([]);
    const [data, setData] = useState([]);
    const [dataCopy, setDataCopy] = useState([]);
    const [isFetched, setIsFetched] = useState(false);
    const [gettingDataFor, setGettingDataFor] = useState('Quran')
    var radio_props = [
        { label: 'Quran ', value: 'Quran' },
        { label: 'Hadees  ', value: 'Hadees' },
        { label: 'Bible  ', value: 'Bible1' }
    ];

    const searchResult = (text, tableName) => {
        setIsFetched(true);
        setGettingDataFor(tableName);
        console.log(`searchResult:${text} TableName : ${tableName}`);
        setData([]);
        // setSearch(text);
        if (text) {
            console.log(search);
            let rowsLength = 0; var temp = [];
            db.transaction((tx) => {
                if (tableName == "Quran") {
                    tx.executeSql(
                        `SELECT * FROM ${tableName} Where AyatText like '%${text}%'`,
                        [],
                        (tx, results) => {
                            rowsLength = results.rows.length;
                            if(rowsLength<10){
                                for (let i = 0; i < results.rows.length; ++i)
                                    temp.push(results.rows.item(i));
                            }else{
                                for (let i = 0; i < 10; ++i)
                                temp.push(results.rows.item(i));
                            }
                            if (rowsLength > 0) {
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
                                setIsFetched(false);
                            } else {
                                setIsFetched(false);
                                alert("No record Found...")
                            }
                        });
                } else if (tableName == "Hadees") {
                    tx.executeSql(
                        `SELECT * FROM ${tableName} Where HadeesText like '%${text}%'`,
                        [],
                        (tx, results) => {
                            rowsLength = results.rows.length;
                            console.log('...', rowsLength);
                            if(rowsLength<10){
                                for (let i = 0; i < results.rows.length; ++i)
                                    temp.push(results.rows.item(i));
                            }else{
                                for (let i = 0; i < 10; ++i)
                                temp.push(results.rows.item(i));
                            }
                            if (rowsLength > 0) {
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
                                setIsFetched(false);
                            } else {
                                setIsFetched(false);
                                alert("No record Found...")
                            }
                        });
                } else if (tableName == "Bible1") {
                    tx.executeSql(
                        `SELECT * FROM ${tableName} Where VerseText like '%${text}%'`,
                        [],
                        (tx, results) => {
                            rowsLength = results.rows.length;
                            console.log('...', rowsLength);
                            if(rowsLength<10){
                                for (let i = 0; i < results.rows.length; ++i)
                                    temp.push(results.rows.item(i));
                            }else{
                                for (let i = 0; i < 10; ++i)
                                temp.push(results.rows.item(i));
                            }
                            if (rowsLength > 0) {
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
                            } else {
                                setIsFetched(false);
                                alert("No record Found...")
                            }
                        });
                }
            });
        } else {
            setData([]);
        }

    }
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput style={styles.input}
                    onChangeText={(text) => setSearch(text)}
                    placeholder={'search here...'} placeholderTextColor={'gray'} />
                <TouchableOpacity onPress={() => searchResult(search, tableName)}
                    style={{ height: 40, backgroundColor: '#015c92', flex: .5, borderRadius: 10, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center' }}>Search</Text>
                </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#fff', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10, }}>
                <Text style={{ fontSize: 18 }}>Search In:</Text>
                <RadioForm
                    radio_props={radio_props}
                    initial={0}
                    formHorizontal={true}
                    buttonColor={'#50C900'}
                    buttonOuterSize={25}
                    selectedButtonColor={"#88cdf6"}
                    selectedLabelColor={"blue"}
                    labelStyle={{ fontSize: 15,fontWeight:'bold'}}
                    onPress={(value) => setTableName(value)}
                />
            </View>
            {
                isFetched == true ? (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    gettingDataFor == "Quran" ? (
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index}
                            renderItem={(item, index) =>
                                <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                    TableName:tableName,
                                    SurahNo: item.item.SurahId,
                                    AyatNo: item.item.AyatId,
                                    Text: item.item.AyatText,
                                })}
                                    style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                                    <View
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Highlighter style={styles.text}
                                        highlightStyle={{ backgroundColor: '#ffa200' }}
                                        searchWords={[searchArray]}
                                        textToHighlight={item.item.HEnglish}
                                        /> */}
                                        <Text style={{ fontSize: 15, color: 'green' }}>Surah No {item.item.SurahId},</Text>
                                        <Text style={{ fontSize: 15, color: 'green' }}>Ayat No {item.item.AyatId}</Text>
                                    </View>
                                    <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.AyatText}</Text>
                                </TouchableOpacity>
                            }
                        />
                    ) : (
                        gettingDataFor == "Hadees" ? (
                            <FlatList
                                data={data}
                                keyExtractor={(item, index) => index}
                                renderItem={(item, index) =>
                                    <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                        TableName:tableName,
                                        JildNo: item.item.JildNo,
                                        HadeesNo: item.item.HadeesNo,
                                        NarratedBy: item.item.NarratedBy,
                                        Text: item.item.HadeesText,
                                    })}
                                        style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                                        <View
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            {/* <Highlighter style={styles.text}
                                        highlightStyle={{ backgroundColor: '#ffa200' }}
                                        searchWords={[searchArray]}
                                        textToHighlight={item.item.HEnglish}
                                        /> */}
                                            <Text style={{ fontSize: 15, color: 'green' }}>Jild No {item.item.JildNo},</Text>
                                            <Text style={{ fontSize: 15, color: 'green' }}>Hadees No {item.item.HadeesNo}</Text>
                                        </View>
                                        <Text style={{ fontSize: 18, }} >{item.item.NarratedBy}</Text>
                                        <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.HadeesText}</Text>
                                    </TouchableOpacity>
                                }
                            />
                        ) : (
                            <FlatList
                                data={data}
                                keyExtractor={(item, index) => index}
                                renderItem={(item, index) =>
                                    <TouchableOpacity onPress={() => navigation.navigate('Detail', {
                                        TableName:tableName,
                                        ChapterNo: item.item.ChapterNo,
                                        VerseNo: item.item.VerseNo,
                                        Text: item.item.VerseText,
                                    })}
                                        style={{ flex: 1, width: '97%', alignSelf: 'center', padding: 10, borderRadius: 8, elevation: 5, marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
                                        <View
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            {/* <Highlighter style={styles.text}
                                        highlightStyle={{ backgroundColor: '#ffa200' }}
                                        searchWords={[searchArray]}
                                        textToHighlight={item.item.HEnglish}
                                        /> */}
                                            <Text style={{ fontSize: 15, color: 'green' }}>Chapter No {item.item.ChapterNo},</Text>
                                            <Text style={{ fontSize: 15, color: 'green' }}>Verse No {item.item.VerseNo}</Text>
                                        </View>
                                        <Text style={{ fontSize: 18, }} numberOfLines={1.5}>{item.item.VerseText}</Text>
                                    </TouchableOpacity>
                                }
                            />
                        )
                    )
                )
            }
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
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
    },
    input: {
        margin: 5,
        flex: 1.5,
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