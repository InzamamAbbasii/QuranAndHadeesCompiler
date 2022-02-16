
import * as React from 'react';
import { View, Text, Button, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import Home from './screens/Home';
import Hadees from './screens/Hadees';
import Search from './screens/Search';
import SearchIndexes from './screens/SearchIndexes';
import Synonyms from './screens/Synonyms';
import ReadFile from './screens/ReadFile';
import Quran from './screens/Quran';
import Bible from './screens/Bible';
import Quran_StopWords from './screens/Quran_StopWords';
import Hadees_StopWords from './screens/Hadees_StopWords';
import Bible_StopWords from './screens/Bible_StopWords';
import Detail from './screens/Detail';
import AddSynonyms from './screens/AddSynonyms';
import SurahList from './screens/SurahList';
import JildList from './screens/JildList';
import BibleChapterList from './screens/BibleChapterList';
import IndexesTabs from './screens/IndexesTabs';
import BibleBooksList from './screens/BibleBooksList';
import AllSynonyms from './screens/AllSynonyms';
import AllWords from './screens/AllWords';
import Yousaf_Ali from './screens/Yousaf_Ali';
import Yousaf_AliChapterList from './screens/Yousaf_AliChapterList';
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={'#185425'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#185425',//#28D6C0' #f4511e
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Hadees" component={Hadees} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="SearchIndexes" component={SearchIndexes} />
        <Stack.Screen name="Synonyms" component={Synonyms} />
        <Stack.Screen name="ReadFile" component={ReadFile} />
        <Stack.Screen name="Quran" component={Quran} />
        <Stack.Screen name="Bible" component={Bible} />
        <Stack.Screen name="Quran_StopWords" component={Quran_StopWords} />
        <Stack.Screen name="Hadees_StopWords" component={Hadees_StopWords} />
        <Stack.Screen name="Bible_StopWords" component={Bible_StopWords} />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="AddSynonyms" component={AddSynonyms} />
        <Stack.Screen name="SurahList" component={SurahList} />
        <Stack.Screen name="JildList" component={JildList} />
        <Stack.Screen name="BibleChapterList" component={BibleChapterList} />
        <Stack.Screen name="IndexesTabs" component={IndexesTabs} />
        <Stack.Screen name="BibleBooksList" component={BibleBooksList} />
        <Stack.Screen name="AllWords" component={AllWords} />
        <Stack.Screen name="AllSynonyms" component={AllSynonyms} />
        <Stack.Screen name="Yousaf_Ali" component={Yousaf_Ali} />
        <Stack.Screen name="Yousaf_AliChapterList" component={Yousaf_AliChapterList} />

      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;