/* @flow */
export const SET_EDITOR_STATE = 'SET_EDITOR_STATE';
import { EditorState } from 'draft-js';

export const setEditorState = (editorState: EditorState) => ({
  type: SET_EDITOR_STATE,
  payload: { editorState },
});
