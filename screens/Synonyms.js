import React, { useState,useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { openDatabase } from 'react-native-sqlite-storage';

const Synonyms = () => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });

    const [word, setWord] = useState('');
    const [word1, setWord1] = useState('');
    const [swapingWord, setSwapingWord] = useState('');
    const [synonym, setSynonym] = useState('');

    const addSynonym = async () => {
        if (word.length == 0) {
            alert('Please Enter Word!')
        } else if (synonym.length == 0) {
            alert('Please Enter Synonyms!')
        } else {
            await db.transaction(function (txn) {
                txn.executeSql(
                    `SELECT * FROM Keywords WHERE Word like ?`,
                    [word],
                    function (tx, res) {
                        if (res.rows.length == 0) {
                            tx.executeSql(
                                'INSERT INTO KeyWords (Word) VALUES (?)',
                                [word],
                                (tx, results) => {
                                    if (results.rowsAffected > 0) {
                                        console.log(`Word ${word} Stored Successfully!`);
                                        storeSynonyms(results.insertId, synonym);
                                    } else alert('Something went worng...');
                                }
                            );
                        } else {
                            tx.executeSql(
                                'Select * from Keywords WHERE Word like ?',
                                [word],
                                (tx, results) => {
                                    storeSynonyms(results.rows.item(0).KID, synonym)
                                }
                            );
                        }
                    });
            });//end db
        }
    }
    const storeSynonyms = (id, synonym) => {
        //if word stored successfully then we will store synonyms of this word in Synonyms table
        db.transaction(function (tx) { //store synonyms
            tx.executeSql(
                'SELECT * FROM Synonyms WHERE KID=? AND Synonym like ?',
                [id,synonym],
                (tx, results) => {
                    if (results.rows.length == 0) {
                        tx.executeSql(
                            'INSERT INTO Synonyms (Synonym,KID) VALUES (?,?)',
                            [synonym, id],
                            (tx, results) => {
                                if (results.rowsAffected > 0) {
                                    alert(`Synonym ${synonym} Stored Successfully!`);
                                } else alert('Something went worng...');
                            }
                        );
                    }
                    else alert('Synonym Already Stored...');
                }
            );
        });//store synonyms end...
    }
    const swap = async () => {
        if (word1.length == 0 || swapingWord.length == 0) {
            alert('Please Fill Required Fileds')
        } else {
            await db.transaction(function (txn) {
                txn.executeSql(
                    'UPDATE Keywords SET Word=? WHERE Word=?',
                    [swapingWord,word1],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                            setWord1('');setSwapingWord('');
                           alert(`Word ${word1} Swaped With ${swapingWord} Successffully!`)
                        } else alert('Word you want to swap is not exist in record.');
                    }
                );
            });//end db

        }
    }
    useEffect(()=>{
     getKeyWords();
      getSynonyms();
    },[])
    const getKeyWords = async () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM KeyWords',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    console.log(temp);
                }
            );
        });
    }
    const getSynonyms = async () => {
        console.log('Synonyms Data....');
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM Synonyms',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    console.log(temp);
                }
            );
        });
    }
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Word</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(txt) => setWord(txt)}
                            placeholder="Enter Word"
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Synonym</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(txt) => setSynonym(txt)}
                            placeholder="Enter Synonyms"
                        />
                    </View>

                    <TouchableOpacity onPress={() => addSynonym()}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}> Add Synonyms </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Word</Text>
                        <TextInput
                            style={styles.input}
                            value={word1}
                            onChangeText={(txt) => setWord1(txt)}
                            placeholder="Enter Word"
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Swaping Word</Text>
                        <TextInput
                            style={styles.input}
                            value={swapingWord}
                            onChangeText={(txt) => setSwapingWord(txt)}
                            placeholder="Enter new Word"
                        />
                    </View>

                    <TouchableOpacity onPress={() => swap()}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}> Swap </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
export default Synonyms;

const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontStyle: 'italic',
        flex: 0.5,
        color: '#fff'
    },
    input: {
        flex: 1,
        marginRight: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
        marginBottom: 15,
        alignSelf: 'center',
        paddingLeft: 5,
        color: '#fff',
        fontSize: 18,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#000',
        marginTop: 12,
        height: 50,
        width: '97%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    card: {
        backgroundColor: '#28D6C0',
        padding: 15,
        margin: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.46,
        shadowRadius: 11.14,
        elevation: 17,
    }
});