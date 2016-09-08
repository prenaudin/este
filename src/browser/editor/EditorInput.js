/* @flow */
import React, { Component } from 'react';
import * as Immutable from 'immutable';
import { Flex } from '../app/components';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { connect } from 'react-redux';
import { setEditorState } from '../../common/editor/actions';
import debounce from 'lodash/debounce';

const EDITOR_DEBOUNCE = 500;

const style = {
  width: 580,
  margin: '40px auto',
};

class EditorInput extends Component {
  constructor(props, context) {
    super(props, context);
    (this:any).onEditorChange = this.onEditorChange.bind(this);
    (this:any).onKeyCommand = this.onKeyCommand.bind(this);
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
    if (!editorState) { return false; }
    this.setState({ editorState });
    this.setEditorState(editorState);
    return true;
  }

  onKeyCommand(command: string) {
    const newEditorState = RichUtils.handleKeyCommand(
      this.state.editorState,
      command
    );
    if (!newEditorState) { return false; }
    this.props.setEditorState(newEditorState);
    return true;
  }

  setEditorState(editorState) {
    this.props.setEditorState(editorState);
  }

  render() {
    return (
      <Flex style={style}>
        <Editor
          onChange={this.onEditorChange}
          editorState={this.state.editorState}
          handleKeyCommand={this.onKeyCommand}
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
