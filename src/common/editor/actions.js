/* @flow */
export const SET_EDITOR_STATE = 'SET_EDITOR_STATE';

export const setEditorState = (editorState) => ({
  type: SET_EDITOR_STATE,
  payload: { editorState },
});
