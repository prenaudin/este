/* @flow */
import React, { Component } from 'react';
import * as Immutable from 'immutable';
import { Flex } from '../app/components';
import { Editor, EditorState } from 'draft-js';
import { connect } from 'react-redux';
import { setEditorState } from '../../common/editor/actions';
import debounce from 'lodash/debounce';

const EDITOR_DEBOUNCE = 500;

class EditorInput extends Component {
  constructor(props, context) {
    super(props, context);
    (this:any).onEditorChange = this.onEditorChange.bind(this);
    (this:any).setEditorState = debounce(this.setEditorState, EDITOR_DEBOUNCE);
    this.state = {
      editorState: props.editorState,
    };
  }

  state: {
    editorState: EditorState,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      editorState: nextProps.editorState,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldComponentUpdate = (
      !Immutable.is(nextProps.editorState, nextState.editorState) ||
      !Immutable.is(this.state.editorState, nextState.editorState)
    );
    return shouldComponentUpdate;
  }

  onEditorChange(editorState: EditorState) {
    this.setState({ editorState });
    this.setEditorState(editorState);
  }

  setEditorState(editorState) {
    this.props.setEditorState(editorState);
  }

  render() {
    return (
      <Flex>
        <Editor
          onChange={this.onEditorChange}
          editorState={this.state.editorState}
        />
      </Flex>
    );
  }
}

EditorInput.propTypes = {
  setEditorState: React.PropTypes.func.isRequired,
  editorState: React.PropTypes.instanceOf(EditorState).isRequired,
};

export default connect(state => ({
  editorState: state.editor.get('editorState'),
}), { setEditorState })(EditorInput);
