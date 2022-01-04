import React, { useState, useEffect, } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { openDatabase } from 'react-native-sqlite-storage';
const Detail = ({ navigation, route }) => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });
    console.log(route.params);
    let array = [""];
    route.params.SearchWord1.forEach(element => {
        console.log(element.Syn);
        array.push(element.Syn);
    });
    return (
        <ScrollView style={styles.container}>
            {
                route.params.TableName == "Quran" ? (
                    <>
                        <View style={{ padding: 10 }}>
                            <Text style={[styles.text, { color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10 }]} >Surah {route.params.SurahNo} : Ayat {route.params.AyatNo}</Text>
                            {/* <Highlighter style={styles.text}
                                highlightStyle={{ backgroundColor: '#ffa200' }}
                                searchWords={array}
                                textToHighlight={route.params.Text}
                            /> */}
                            <Text style={styles.text}>{route.params.Text} </Text>
                        </View>
                    </>
                ) : (
                    route.params.TableName == "Hadees" ? (
                        <View style={{ padding: 10 }}>
                            <Text style={[styles.text, { color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10 }]} >Jild {route.params.JildNo} : Hadees {route.params.HadeesNo}</Text>
                            <Text style={[styles.text, { fontWeight: '500' }]}>{route.params.NarratedBy} </Text>
                            <Text style={styles.text}>{route.params.Text} </Text>
                            {/* <Highlighter style={styles.text}
                                highlightStyle={{ backgroundColor: '#ffa200' }}
                                searchWords={array}
                                textToHighlight={route.params.Text}
                            /> */}
                        </View>
                    ) : (
                        <View style={{ padding: 10 }}>
                            <Text style={[styles.text, { color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 10 }]} >Chapter {route.params.ChapterNo} : Verse {route.params.VerseNo}</Text>
                            <Text style={styles.text}>{route.params.Text} </Text>
                            {/* <Highlighter style={styles.text}
                                highlightStyle={{ backgroundColor: '#ffa200' }}
                                searchWords={array}
                                textToHighlight={route.params.Text}
                            /> */}
                        </View>
                    )
                )
            }
        </ScrollView>
    );
}

export default Detail;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    text: {
        fontSize: 24,
        backgroundColor: '#f7f7f7',
    },
    MainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
   
    highlightText:{
      backgroundColor: 'yellow',
      fontSize: 26,
      textAlign: 'center'
    },
})