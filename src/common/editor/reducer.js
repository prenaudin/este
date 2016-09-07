/* @flow weak */
import * as actions from './actions';
import Editor from './editor';

const editorReducer = (state = new Editor(), action) => {
  switch (action.type) {

    case actions.SET_EDITOR_STATE: {
      return state
        .set('editorState', action.payload.editorState)
        .set('previousEditorState', state.get('editorState'));
    }

    default:
      return state;

  }
};

export default editorReducer;
