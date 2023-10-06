import { useCallback, useRef, MouseEvent, TouchEvent} from 'react';
import ReactFlow, {Node, Panel, Controls, MiniMap, OnConnectStart, OnConnectEnd,
  ConnectionLineType, SelectionMode, useStoreApi, OnConnectStartParams
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import useStore, {RFState} from './store/store';
import TextUpdaterNode from './customNodes/TextUpdaterNode/TextUpdaterNode.component';
import TriangleNode from './customNodes/Triangle/TriangleNode.component';

import 'reactflow/dist/style.css'
import Modal from './components/Modal.component';
const nodeTypes = {
  textUpdater: TextUpdaterNode,
  triangle: TriangleNode
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
function App() {
  const {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, addNode, showModal, setShowModal, setModalInfo
  } = useStore(selector, shallow);
  
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
      const differenceY = (sourceEventPosition.clientY as number) - (event as unknown as MouseEvent).clientY
      const differenceX = (sourceEventPosition.clientX as number) - (event as unknown as MouseEvent).clientX

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
  return (
    <div className='flowWrapper'>
      {showModal && <Modal></Modal>}
      <ReactFlow 
        nodes={nodes} edges={edges} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.Bezier}
        onConnect={onConnect}
        defaultEdgeOptions={{animated: true}}
        nodeTypes={nodeTypes}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode='Delete'
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        fitView>
        <Panel position='top-left' color='black'> React Flow Demo </Panel>
        <Panel position='top-right'> press 'Del' to delete a selected element</Panel>
        <Controls showInteractive={false}></Controls>
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable   ></MiniMap>
      </ReactFlow>
    </div>
  )
}

export default App
