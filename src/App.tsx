import { useCallback, useRef, useState, useMemo, MouseEvent, TouchEvent, memo} from 'react';
import ReactFlow, {Node, Edge, Panel, Controls, MiniMap, OnConnectStart, OnConnectEnd, useReactFlow,
  ConnectionLineType, SelectionMode, useStoreApi, OnConnectStartParams, OnSelectionChangeFunc, OnSelectionChangeParams
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import useStore, {RFState} from './store/store';

import TextUpdaterNode from './customNodes/TextUpdaterNode/TextUpdaterNode.component';
import TriangleNode from './customNodes/Triangle/TriangleNode.component';
import DeleteBtnEdge from './customEdges/DeleteBtnEdge/DeleteBtnEdge.component';

import 'reactflow/dist/style.css'
import Modal from './components/Modal.component';
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
type ConnectStartRef = {
  param: OnConnectStartParams,
  event?:  MouseEvent | TouchEvent
} | null

const defultEdgeOptions = {
  type: 'deleteBtn'
}


const App = memo(()=>{
  const reactFlowInstance = useReactFlow()
  const {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, addNode, showModal, setShowModal, setModalInfo
  } = useStore(selector, shallow);

  const [selection, setSelection] = useState({nodes: [], edges: []} as OnSelectionChangeParams)
  const [copiedSelection, setCopiedSelection] = useState<OnSelectionChangeParams | null>(null)

  const canCopy = useMemo(():boolean=> selection.nodes.length > 0, [selection])
  const store = useStoreApi()
  const connectStartRef = useRef<ConnectStartRef>(null)
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
  const onConnectStart: OnConnectStart = (event, param)=>{
    connectStartRef.current = {event: event, param}
  }
  const onConnectEnd:OnConnectEnd = useCallback((event)=>{
    const classList = (event.target as Element).classList
    if(connectStartRef.current !== null && classList.contains('react-flow__pane')){
      const state = store.getState()
      const sourceNode:Node = (state.getNodes().find((node)=> node.id == connectStartRef.current?.param.nodeId)) as Node
      const sourceEventPosition = {clientX: (connectStartRef.current?.event as MouseEvent)?.clientX,
        clientY: (connectStartRef.current?.event as MouseEvent)?.clientY,
      }
      const differenceY = ((sourceEventPosition.clientY as number) - (event as unknown as MouseEvent).clientY)
      const differenceX = ((sourceEventPosition.clientX as number) - (event as unknown as MouseEvent).clientX)

      addNode(sourceNode, {x: sourceNode.position.x - differenceX, y: sourceNode.position.y - differenceY})
      connectStartRef.current = null
    }
  }, [])

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
        <Panel position='top-left'> React Flow Demo </Panel>
        <Panel position='top-right' className='copy-paste-panel'>
          <button className='copy-paste-btn' onClick={cutHandler} disabled={!canCopy}>cut</button>
          <button className='copy-paste-btn' onClick={copyHandler} disabled={!canCopy}>copy</button>
          <button className='copy-paste-btn' onClick={pasteHandler} disabled={copiedSelection === null}>paste</button>
        </Panel>
        <Panel position='bottom-center'> press 'Del' to delete a selected element</Panel>
        <Controls showInteractive={false}></Controls>
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable></MiniMap>
      </ReactFlow>
    </div>
  )
})

export default App
