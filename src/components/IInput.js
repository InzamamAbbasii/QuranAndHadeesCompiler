import React from 'react';
import { Text, View, StyleSheet, TextInput } from "react-native";

const IInput = (props) => {
    return (
        <TextInput
            style={{ height: 50, borderColor: '#000', borderWidth: 1,marginBottom:5 }}
            placeholder={props.placeholder}
            value={props.value}
            onChangeText={props.onChangeText}
        />
    )
}
export default IInput;