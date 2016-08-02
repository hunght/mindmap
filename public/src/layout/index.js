/*
import * as structureClasses from '../constants/StructureClasses';

import logicToRight from './logic/logictoright';

export default {
  [structureClasses.LOGICTORIGHT] : logicToRight
};*/

import { mindTree } from '../managers';

import logicToRight from './logic/logictoright';


// 保存一个map，map应该记录每个id对应的组件应该所在的位置，供最后setPosition使用

// 开始计算所有组件的位置，根据tree，从顶部至尾部遍历，每个组件的structureClass决定它的直接子后代的排列方式

// 目前只考虑logictoright排列模式

/**
 * 每个组件应该由它的直接子后代的bounds信息算出它本身的bounds，若该组件没有直接子后代，则它本身的bounds等于boxSize + 各个边的内补
 **/

const paddingLeft = 20;
const paddingRight = 20;
const paddingHor = paddingLeft + paddingRight;
const paddingTop = 10;
const paddingBottom = 10;
const paddingVer = paddingTop + paddingBottom;

export default () => {
  const positionMap = {};
  
  const componentMap = mindTree.getMap();

  const tree = mindTree.getTree();
  
  positionMap[tree.id] = tree.position = [300, 300];

  calcComponentsBounds(tree);
  
  calcChildrenPosition(tree);

  Object.keys(componentMap).forEach((id) => {
    const position = positionMap[id];
    componentMap[id].setPosition(position);
  });

  function calcComponentsBounds(parentTree) {
    const component = componentMap[parentTree.id];

    const bounds = {
      width : component.boxSize.width + paddingHor,
      height : component.boxSize.height + paddingVer
    };

    parentTree.children.forEach((childTree) => {
      const childBounds = calcComponentsBounds(childTree);
      bounds.width += childBounds.width;
      bounds.height += childBounds.height;
    });

    parentTree.bounds = bounds;
    parentTree.boxSize = component.boxSize;
    
    return bounds;
  }

  function calcChildrenPosition(parentTree) {
    const parentId = parentTree.id;

    // todo 根据structure决定摆放位置的方式
    const structure = componentMap[parentId].props.topicInfo.structureClass;

    const children = parentTree.children;
    
    logicToRight(parentTree, positionMap);

    children.forEach((childTree) => {
      calcChildrenPosition(childTree);
    });
  }
}