/* @flow */
import Immutable from 'immutable';
import { Record } from '../transit';
import { EditorState, ContentState } from 'draft-js';

const DEFAULT_TEXT = (
`Hi there 👋

The purpose of this example is the test the ability of Draft.js
to work with Operational Transformation. Try to change some content
and open your console to review changes as operations.

Thanks for trying 👌`
);

const EditorRecord = Record({
  // Default EditorState for testing purpose
  editorState: EditorState.createWithContent(
    ContentState.createFromText(DEFAULT_TEXT)
  ),
  previousEditorState: EditorState.createEmpty(),
}, 'editor');

class Editor extends EditorRecord {
  // Bypass transit storage
  toMap() {
    return new Immutable.Map();
  }

  // Bypass transit storage
  toObject() {
    return {};
  }
}

export default Editor;
