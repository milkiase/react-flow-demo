import { useCallback, useRef, useState, useMemo, MouseEvent} from 'react';
import ReactFlow, {Node, Edge, Panel, Controls, 
  MiniMap, OnConnectStart, OnConnectEnd, useReactFlow,
  ConnectionLineType, SelectionMode, useStoreApi, 
  OnSelectionChangeFunc, OnSelectionChangeParams, 
  Background
} from 'reactflow';
import type {TemporalState} from 'zundo';
import {useStore} from 'zustand';

import ExportButton from './utils/ExportBtn/ExportBtn.component';

import { shallow } from 'zustand/shallow';
import useFlowStore, {RFState} from './store/store';

import TextUpdaterNode from './utils/customNodes/TextUpdaterNode/TextUpdaterNode.component';
import TriangleNode from './utils/customNodes/Triangle/TriangleNode.component';
import DeleteBtnEdge from './utils/customEdges/DeleteBtnEdge/DeleteBtnEdge.component';

import 'reactflow/dist/style.css';
import Modal from './components/Modal/Modal.component';
import { nanoid } from 'nanoid/non-secure';

const nodeTypes = {
  textUpdater: TextUpdaterNode,
  triangle: TriangleNode
}
const edgeTypes = {
  deleteBtn: DeleteBtnEdge
}
const selector = (state:RFState)=>(
  {
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange:state.onNodesChange,
    onEdgesChange:state.onEdgesChange,
    onConnect:state.onConnect,
    addNode: state.addNode,
    showModal: state.showModal,
    setShowModal: state.setShowModal,
    setModalInfo: state.setModalInfo
  }
)

const defultEdgeOptions = {
  type: 'deleteBtn'
}

// converting the zundo store to a React hook using create from zustand
const useTemporalStore = <T,>(
  selector: (state: TemporalState<RFState>) => T,
  equality?: (a: T, b: T) => boolean,
) => useStore(useFlowStore.temporal, selector, equality);

const App = ()=>{
  const reactFlowInstance = useReactFlow()
  const {undo, redo, futureStates, pastStates, clear} = useTemporalStore(state => state)
  const {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, addNode, showModal, setShowModal, setModalInfo
  } = useFlowStore(selector, shallow);

  const [selection, setSelection] = useState({nodes: [], edges: []} as OnSelectionChangeParams)
  const [copiedSelection, setCopiedSelection] = useState<OnSelectionChangeParams | null>(null)

  const canCopy = useMemo(():boolean=> selection.nodes.length > 0, [selection])
  const store = useStoreApi()
  const connectStartRef = useRef<string | null>(null)
  const nodeColor = (node: Node):string=>{
    switch(node.type){
      case('input'):
        return 'lightgreen';
      case 'default':
        return 'pink';
      case 'textUpdater':
        return 'purple';
      case 'triangle':
        return 'red';
      default:
        return 'grey'
    }
  }
  const onConnectStart: OnConnectStart = (_, {nodeId})=>{
    connectStartRef.current = nodeId
  }
  const onConnectEnd:OnConnectEnd = useCallback((event)=>{
    const classList = (event.target as Element).classList
    const {clientX, clientY} = event as unknown as MouseEvent
    if(connectStartRef.current !== null && classList.contains('react-flow__pane')){
      const sourceNode:Node = (nodes.find((node)=> node.id == connectStartRef.current)) as Node
      const {domNode} = store.getState()
      if(!domNode) return
      
      const{left, top} = domNode.getBoundingClientRect()
      const zoom = reactFlowInstance.getZoom()
      const panePosition = reactFlowInstance.project({
        x: (clientX - left - (sourceNode.width as number)/2 * zoom), 
        y: (clientY - top - (sourceNode.height as number)/ 2 * zoom)
      })
      addNode(sourceNode, panePosition)
      connectStartRef.current = null
    }
  }, [nodes, reactFlowInstance, store])

  const onNodeClick = useCallback((_: MouseEvent, node: Node)=>{
    const type = node.type
    if(type === 'triangle'){
      setModalInfo('You clicked on the "Triangular" node.')
      setShowModal(true)
    }else if(type === 'group'){
      setModalInfo('You clicked on the "Rectangular" node.')
      setShowModal(true)
    }
  }, [])

  const onSelectionChange:OnSelectionChangeFunc = useCallback((params)=>{
    setSelection(params)
  }, [])

  const cutHandler = useCallback(()=>{
    setCopiedSelection(selection)
    reactFlowInstance.deleteElements(selection)
  }, [reactFlowInstance, selection])

  const copyHandler = useCallback(()=>{
    setCopiedSelection(selection)
  }, [selection])

  const pasteHandler = useCallback(()=>{
    // replacing duplicate node's id by new id and and updating it in the copiedEdges if it is used
    // as a source or target
    (copiedSelection as OnSelectionChangeParams).nodes = copiedSelection?.nodes.map((copiedNode)=> {
      const newId = nanoid()
      const oldId = copiedNode.id
      if(nodes.some((node)=> node.id === copiedNode.id)){
        copiedSelection.edges.forEach((copiedEdge, index)=>{
          if(copiedEdge.source === copiedNode.id){
            copiedSelection.edges[index].source = newId
          }
          if(copiedEdge.target === copiedNode.id){
            copiedSelection.edges[index].target = newId
          }
        })
        copiedNode.id = newId
      }

      // checking/changing if there is any node whose parentNode should be updated
      copiedSelection.nodes.forEach((node, index)=> {
        if(node.parentNode === oldId){
          copiedSelection.nodes[index].parentNode = newId
        }
      })
      return copiedNode
    }) as Node[]
    
    // replacing duplicate edge's id by new id
    (copiedSelection as OnSelectionChangeParams).edges = copiedSelection?.edges.map((copiedEdge)=>{
      if(edges.some((edge)=> edge.id === copiedEdge.id)){
        const newId = nanoid()
        copiedEdge.id = newId
      }
      return copiedEdge
    }) as Edge[]

    // we can also create a action in the state that does the same thing as bellow 
    // but we are using the builtin functionality
    reactFlowInstance.setNodes(nodes.concat(copiedSelection?.nodes as Node[]))
    reactFlowInstance.setEdges(edges.concat(copiedSelection?.edges as Edge[]))
  }, [copiedSelection, edges, nodes, reactFlowInstance])

  return (
    <div className='flowWrapper'>
      {showModal && <Modal></Modal>}
      <ReactFlow 
        nodes={nodes} edges={edges} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.Straight}
        defaultEdgeOptions={defultEdgeOptions}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode='Delete'
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        fitView>
        <Panel position='top-left' className='copy-paste-panel'>
          <button className='copy-paste-btn' onClick={cutHandler} disabled={!canCopy}><img className='icon' src="src\assets\Cut.png" alt=""/> cut</button>
          <button className='copy-paste-btn' onClick={copyHandler} disabled={!canCopy}> <img className='icon' src="src\assets\Copy.png" alt=""/>copy</button>
          <button className='copy-paste-btn' onClick={pasteHandler} disabled={copiedSelection === null}> <img className='icon' src="src\assets\Paste.png" alt=""/> paste</button>

          <button className='copy-paste-btn' disabled={(pastStates.length === 0)} onClick={()=>undo()}> <img className='icon' src="src\assets\Undo.png" alt=""/> </button>
          <button className='copy-paste-btn' disabled={(futureStates.length === 0)} onClick={()=>redo()}> <img className='icon' src="src\assets\Redo.png" alt=""/> </button>
          <button className='copy-paste-btn' onClick={()=>clear()}>  clear</button>

        </Panel>
        <ExportButton></ExportButton>
        <Panel position='bottom-center'> press 'Del' to delete a selected element</Panel>
        <Controls showInteractive={false}></Controls>
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable></MiniMap>
        <Background ></Background>
      </ReactFlow>
    </div>
  )
}

export default App
