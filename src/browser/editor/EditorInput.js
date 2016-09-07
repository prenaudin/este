/* @flow */
import React from 'react';
import { Flex } from '../app/components';
import { Editor } from 'draft-js';
import { connect } from 'react-redux';
import { setEditorState } from '../../common/editor/actions';

const EditorInput = (props) => (
  <Flex>
    <Editor
      onChange={props.setEditorState}
      editorState={props.editorState}
    />
  </Flex>
);

EditorInput.propTypes = {
  setEditorState: React.PropTypes.func.isRequired,
  editorState: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  editorState: state.editor.get('editorState'),
}), { setEditorState })(EditorInput);
