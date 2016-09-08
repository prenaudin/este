/* @flow */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import diffContentStateText from '../../common/editor/diffContentStateText';
// import diffContentStateStyle from '../../common/editor/diffContentStateStyle';

class EditorLogger extends Component {
  componentDidUpdate() {
    console.time('diffContentStateText'); //eslint-disable-line
    const textChanges = diffContentStateText(
      this.props.previousContentState,
      this.props.contentState
    );
    console.timeEnd('diffContentStateText', textChanges.toJSON()); //eslint-disable-line
    console.log(textChanges.toJSON()); // eslint-disable-line

    // console.time('diffContentStateStyle'); //eslint-disable-line
    // const styleChanges = diffContentStateStyle(
    //   this.props.previousContentState,
    //   this.props.contentState
    // );
    // console.timeEnd('diffContentStateStyle', styleChanges.toJSON()); //eslint-disable-line
    // console.log(styleChanges.toJSON()); // eslint-disable-line
  }

  render() {
    return null;
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
