/* @flow */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import diffContentStateText from '../../common/editor/diffContentStateText';

class EditorLogger extends Component {
  componentDidUpdate() {
    const changes = diffContentStateText(
      this.props.previousContentState,
      this.props.contentState
    );
    console.log(changes.toJSON()); // eslint-disable-line
  }

  render() {
    return false;
  }
}

EditorLogger.propTypes = {
  contentState: PropTypes.any.isRequired,
  previousContentState: PropTypes.any.isRequired,
};

export default connect(state => ({
  contentState: state.editor.get('editorState').getCurrentContent(),
  previousContentState: state.editor.get('previousEditorState').getCurrentContent(),
}), null)(EditorLogger);
