import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
export default function Hadees({ navigation, route }) {
    const [data, setData] = useState([]);
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
                        for (let i = 0; i < 200; ++i)
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
                });
        });
    }, []);
    return (
        <View style={{
            padding: 10, flex: 1, backgroundColor: '#fff'
        }}>


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



            {/* <View
                style={{ flexDirection: 'row' }}
            >
                <Text style={{ flexShrink: 1 }}>
                    Really really long text...{file}
                </Text>
            </View> */}
            {/* <View style={{flexDirection:'row'}}>
            <Text style={{fontSize:20}}>
            1) Alqamah ibn Waqqas al-Laythi said, "I heard Umar, while he was on the Mimbar (pulpit) delivering a sermon, saying, `I heard the Messenger of Allah say, `O people! Behold, the action(s) are but (judged) by intention(s) and every man shall have but that which he intended.
            </Text>
            </View>
            
            <View style={{flexDirection:'row'}}>
            <Text style={{fontSize:20}}>
            2) Al-Harith ibn Hisham asked Allah's Apostle, peace be upon him, "O Allah's Apostle! How is the Divine Inspiration revealed to you? Allah's Apostle replied, "Sometimes it is (revealed) like the ringing of a bell, this form of Inspiration is the hardest of all and then this state passes off after I have grasped what is inspired. Sometimes the Angel comes in the form of a man and talks to me and I grasp whatever he says."
            </Text>
            </View>
           
            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
            <Text style={{fontSize:20}}>
            3) The commencement of the Divine Inspiration of Allah's Apostle was in the form of good dreams which came true like bright daylight, and then the love of seclusion was bestowed upon him. He used to go in seclusion in the cave of Hira where he used to worship (Allah alone) continually for many days before wishing to see his family. He used to take with him provisions for the stay and then come back to (his wife) Khadijah to eat his food again as before.
            </Text>
            </View> */}
            {/* <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={(item, index) =>
                    <View */}
            {/* //style={{ flex: 1, width: '97%', alignSelf: 'center', borderRadius: 8, elevation: 5, flexDirection: 'column', alignItems: 'center', marginBottom: 20, justifyContent: 'center', backgroundColor: '#fff' }}> */}
            {/* <Text style={{ fontSize: 20, }}>HID : {item.item.HID}</Text> */}
            {/* <Text style={{
                            fontSize: 20,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            padding: 10
                        }}> {item.item.HArabicText}</Text> */}
            {/* <Text style={{borderWidth:2,borderColor:'red',width:'95%',height:2}}></Text>
                        <Text style={{
                            fontSize: 20,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            padding: 10
                        }}> {item.item.HUrduText}</Text> */}
            {/* </View> */}
            {/* } */}
            {/* /> */}
        </View>
    );
}