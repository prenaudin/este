/* @flow */
import './Editor.scss';
import React from 'react';
import {
  Title,
  View,
} from '../app/components';
import EditorInput from './EditorInput';

const EditorPage = () => (
  <View>
    <Title message="Draft.js with OT logging" />
    <EditorInput />
  </View>
);

export default EditorPage;
