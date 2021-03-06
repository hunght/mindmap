import * as React from 'react';
import { connect } from 'dva'
import { Spin } from 'src/components/ui/antd'
import { dragSelectReceiver } from 'src/apptools/addon';
import { sheetState, appState } from 'src/interface'

interface SheetProps {
  sheet: sheetState
  selectionList: Array<string>
  receivingInitState: boolean
  dispatch: Function
}

class Sheet extends React.Component<SheetProps, any> {

  topicsContainer: HTMLElement;

  editReceiver: HTMLElement;

  onWheel(e) {
    e.preventDefault();
    this.moveTopicsContainer(e.deltaX, e.deltaY);
    this.moveEditReceiver(e.deltaX, e.deltaY);
  }

  onMouseDown(e) {
    dragSelectReceiver.dragStart(e);
  }

  onMouseUp() {
    if (this.props.selectionList.length !== 0) {
      // clear target topic list
      this.props.dispatch({type: 'map/clearSelectionList', ignoreUndo: true});
    }
  }

  // todo try svg animation
  moveTopicsContainer(deltaX, deltaY) {
    if (deltaX === 0 && deltaY === 0) return false;

    const {topicsContainer} = this;
    const transformAttr = topicsContainer.getAttribute('transform');
    const execResult = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttr);
    const [preX, preY] = execResult ? [Number(execResult[1]), Number(execResult[2])] : [0, 0];
    const [newX, newY] = [preX - deltaX, preY - deltaY];

    topicsContainer.setAttribute('transform', `translate(${newX},${newY})`);
  }

  moveEditReceiver(deltaX, deltaY) {
    if (deltaX === 0 && deltaY === 0) return false;

    const {editReceiver} = this;

    if (Number(editReceiver.style.zIndex) < 0) return false;

    const {left: preLeft, top: preTop} = editReceiver.style;
    editReceiver.style.left = parseInt(preLeft) - deltaX + 'px';
    editReceiver.style.top = parseInt(preTop) - deltaY + 'px';
  }

  componentDidMount() {
    this.topicsContainer = document.querySelector('.topics-group') as HTMLElement;
    this.editReceiver = document.querySelector('#editReceiver') as HTMLElement;
  }

  render() {
    const spinProps = {
      spinning: this.props.receivingInitState,
      size: 'large',
      wrapperClassName: 'sheet-loading-container'
    };

    const sheetProps = {
      id: 'sheet',
      style: {backgroundColor: this.props.sheet.backgroundColor},
      onWheel: (e) => this.onWheel(e),
      onMouseDown: (e) => this.onMouseDown(e),
      onMouseUp: () => this.onMouseUp()
    };

    return (
      <Spin {...spinProps}>
        <svg {...sheetProps}>
          { this.props.children }
        </svg>
      </Spin>
    );
  }
}

const mapStateToProps = ({sheet, map, app}) => {
  return {
    sheet,
    selectionList: map.selectionList,
    receivingInitState: app.receivingInitState
  };
};

export default connect(mapStateToProps)(Sheet);