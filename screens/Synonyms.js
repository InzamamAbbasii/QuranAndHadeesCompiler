import React from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";

const Synonyms = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center',padding:10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontStyle: 'italic',flex:0.5 }}>Word</Text>
                <TextInput
                    style={styles.input}
                    // onChangeText={onChangeNumber}
                    // value={number}
                    placeholder="Enter Word"
                    keyboardType="numeric"
                />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontStyle: 'italic',flex:0.5 }}>Synonyms</Text>
                <TextInput
                    style={styles.input}
                    // onChangeText={onChangeNumber}
                    // value={number}
                    placeholder="Enter Synonyms"
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity
                style={styles.button}
            >
                <Text style={styles.buttonText}> Add Synonyms </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
            >
                <Text style={styles.buttonText}>Swap</Text>
            </TouchableOpacity>
        </View>
    );
}
export default Synonyms;

const styles = StyleSheet.create({
    input: {
        flex:1,
        marginRight:5,
        borderBottomWidth: 2,
        marginBottom: 15,
        alignSelf: 'center',
        paddingLeft:5,
    },
    buttonText:{
        color:'#fff',
        fontSize:20,
        fontWeight:'bold',
       },
    button: {
        backgroundColor:'#3a53a6',
        marginTop:12,
        height:50,
        width:'97%',
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'center',
        borderRadius:30
    },
});