/* @flow */
import './Editor.scss';
import React from 'react';
import {
  Title,
  View,
} from '../app/components';
import EditorInput from './EditorInput';
import EditorLogger from './EditorLogger';

const EditorPage = () => (
  <View>
    <Title message="Draft.js with OT logging" />
    <EditorInput />
    <EditorLogger />
  </View>
);

export default EditorPage;
