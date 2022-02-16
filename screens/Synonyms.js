import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, FlatList,LogBox } from "react-native";
import { openDatabase } from 'react-native-sqlite-storage';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import Feather from 'react-native-vector-icons/Feather';

const Synonyms = ({navigation,route}) => {
    var db = openDatabase({ name: 'ReadFile.db', createFromLocation: 1 });

    const [word, setWord] = useState('');
    const [word1, setWord1] = useState('');
    const [swapingWord, setSwapingWord] = useState('');
    const [synonym, setSynonym] = useState('');

    const [suggestionsList, setSuggestionsList] = useState(null)
    const [synonymsSuggestionsList, setSynonymsSuggestionsList] = useState(null)
    const [suggestionLoader, setSuggestionLoader] = useState(false);

    const [showWordSuggestions, setShowWordSuggestions] = useState(false);
    const [showWordSuggestions1, setShowWordSuggestions1] = useState(false);
    const [showSynonymSuggestions, setShowSynonymSuggestions] = useState(false);
    useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
      }, [])
    const addSynonym = async () => {
        console.log(word, ',', synonym);
        setShowWordSuggestions(false);setShowSynonymSuggestions(false);
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
        setShowWordSuggestions1(false);
        //if word stored successfully then we will store synonyms of this word in Synonyms table
        db.transaction(function (tx) { //store synonyms
            tx.executeSql(
                'SELECT * FROM Synonyms WHERE KID=? AND Synonym like ?',
                [id, synonym],
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
                    [swapingWord, word1],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                            setWord1(''); setSwapingWord('');
                            alert(`Word ${word1} Swaped With ${swapingWord} Successffully!`)
                        } else alert('Word you want to swap is not exist in record.');
                    }
                );
            });//end db

        }
    }
    // useEffect(() => {
    //     //  getKeyWords();
    //     //   getSynonyms();
    // }, [])
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
    const getWordSuggestions = async (q) => {
        // setShowWordSuggestions(true);
        setSuggestionLoader(true); setSuggestionsList([]);
        if (q.length == 0) {
            setSuggestionsList(null); setSuggestionLoader(false);
            return
        }
        await db.transaction((tx) => {
            tx.executeSql(
                // `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '%${q}%'`,
                `select * from KeyWords Where Word like'${q}%'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    for (let i = 0; i < results.rows.length; ++i) {
                        let obj = {
                            id: results.rows.item(i).KID,
                            title: results.rows.item(i).Word
                        }
                        if (obj.title.length > 0)
                            temp.push(obj);
                    }
                    setSuggestionsList(temp);
                }
            );
        });
        setSuggestionLoader(false);
    }

    const getSynonymsSuggestions = async (q) => {
        setSuggestionLoader(true); setSynonymsSuggestionsList([]);
        setShowSynonymSuggestions(true);
        // setSynonym(q); 
        console.log(`q: ${q} , Word: ${word}`);
        if (word.length == 0) {
            setSynonymsSuggestionsList(null); setSuggestionLoader(false);
            return
        }
        await db.transaction((tx) => {
            tx.executeSql(
                `select * from KeyWords JOIN Synonyms on KeyWords.KID=Synonyms.KID WHERE Word like '${word}' AND Synonym like '${q}%'`,
                [],
                (tx, results) => {
                    var temp = [];
                    console.log(results.rows.length);
                    for (let i = 0; i < results.rows.length; ++i) {
                        let obj = {
                            id: results.rows.item(i).SID,
                            title: results.rows.item(i).Synonym
                        }
                        console.log('obj', obj);
                        if (obj.title.length > 0)
                            temp.push(obj);
                    }
                    setSynonymsSuggestionsList(temp);
                }
            );
        });
        console.log('end');
        setSuggestionLoader(false);
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Word</Text>
                        <TextInput
                            style={styles.input}
                            value={word}
                            onChangeText={(txt) => { setWord(txt),setShowWordSuggestions(true), getWordSuggestions(txt) }}
                            placeholder="Enter Word"
                        />
                    </View>
                    {
                        showWordSuggestions == true &&
                            <FlatList 
                                data={suggestionsList}
                                keyExtractor={(item, index) => index}
                                renderItem={(item, index) =>
                                    <TouchableOpacity onPress={() => {setWord(item.item.title),setShowWordSuggestions(false)}}
                                        style={{ flex: 1, width: '70%', alignSelf: 'flex-end', paddingHorizontal: 10, borderRadius: 5, marginBottom: 3, justifyContent: 'center', backgroundColor: '#fff' }}>
                                        <Text style={{ color: '#000', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 12, fontSize: 12 }} >{item.item.title} </Text>
                                    </TouchableOpacity>
                                }
                            />
                    }

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Synonym</Text>
                        <TextInput
                            style={styles.input}
                            value={synonym}
                            onChangeText={(txt) => { setSynonym(txt), getSynonymsSuggestions(txt) }}
                            placeholder="Enter Synonyms"
                            onFocus={()=>getSynonymsSuggestions(synonym)}
                        /> 
                    </View>
                    {
                        showSynonymSuggestions == true &&
                        <View >
                            <FlatList 
                                data={synonymsSuggestionsList}
                                keyExtractor={(item, index) => index}
                                renderItem={(item, index) =>
                                    <TouchableOpacity onPress={() =>{ setSynonym(item.item.title),setShowSynonymSuggestions(false)}}
                                        style={{ flex: 1, width: '70%', alignSelf: 'flex-end', paddingHorizontal: 10, borderRadius: 5, marginBottom: 3, justifyContent: 'center', backgroundColor: '#fff' }}>
                                        <Text style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 12, fontSize: 12 }} >{item.item.title} </Text>
                                    </TouchableOpacity>
                                }
                            />
                        </View>
                    }
                    <TouchableOpacity onPress={() => addSynonym()}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}> Add Synonyms </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AllWords')}
                        style={[styles.button,{backgroundColor:'blue'}]}
                    >
                        <Text style={styles.buttonText}> View Synonyms </Text>
                    </TouchableOpacity>
                </View>
{/* ------------------------------------------------------------ SECOND CARD -------------------------------------------------------------- */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Word</Text>
                        <TextInput
                            style={styles.input}
                            value={word1}
                            onChangeText={(txt) => { setWord1(txt),setShowWordSuggestions1(true) ,getWordSuggestions(txt) }}
                            placeholder="Enter Word"
                        />
                    </View>
                    {
                        showWordSuggestions1 == true &&
                            <FlatList 
                                data={suggestionsList}
                                keyExtractor={(item, index) => index}
                                renderItem={(item, index) =>
                                    <TouchableOpacity onPress={() => {setWord1(item.item.title),setShowWordSuggestions1(false)}}
                                        style={{ flex: 1, width: '70%', alignSelf: 'flex-end', paddingHorizontal: 15, borderRadius: 5, marginBottom: 3, justifyContent: 'center', backgroundColor: '#fff' }}>
                                        <Text style={{ color: '#000', fontWeight: 'bold', backgroundColor: '#fff', paddingVertical: 12, fontSize: 12 }} >{item.item.title} </Text>
                                    </TouchableOpacity>
                                }
                            />
                    }

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