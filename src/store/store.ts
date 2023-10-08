import {create} from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect,
    applyNodeChanges, applyEdgeChanges, addEdge, Connection, EdgeChange, NodeChange, XYPosition
} from 'reactflow';
import { nanoid } from 'nanoid/non-secure';

export type RFState = {
    nodes: Node[],
    edges: Edge[],
    onNodesChange: OnNodesChange,
    onEdgesChange: OnEdgesChange,
    onConnect: OnConnect,
    addNode: (source: Node, position: XYPosition)=> void,
    showModal: boolean,
    setShowModal: (bool: boolean)=> void,
    modalInfo: string,
    setModalInfo: (info: string)=> void,
    deleteEdge: (id: string) => void,
}

const useStore = create<RFState>((set, get) => ({
    nodes: [
        {
            id: '1', type: 'input', 
            position: {x: 100, y: 0}, 
            data: {
                label: 'Input Node'
            }, 
            style: {backgroundColor: 'lightgreen'}
        },
        { 
            id: '2', type: 'default', 
            position: {x: 0, y: 100}, 
            data: {label: 'Default Node'}, 
            style: { backgroundColor: '#D60A88', color: 'white' },
        },
        {
            id: '3', type: 'textUpdater', 
            position: {x: 100, y: 200}, 
            data: {label: 'Custom Node'}, 
            style: {backgroundColor: 'purple', color: 'wheat'}
        },
        {
            id: '4', type: 'group',
            position: {x: 300, y: 65},
            data: {label: null},
            style: {backgroundColor: 'lightgreen'}
        },
        {
            id: '5', type: 'triangle',
            parentNode: '4',
            position: {x: 50, y: 30},
            data: {label: null},
            extent: 'parent'
        }
    ],
    edges: [
        {id: 'e1-2', source: '1', target: '2'},
        {id: 'e2-3', source: '2', target: '3', animated: true},
        {id: 'e3-5b', source: '3', target: '5', sourceHandle: 'b'},
        {id: 'e3-5a', source: '3', target: '5', sourceHandle: 'a', animated: true},
    ],
    onNodesChange: (changes:NodeChange[]) => {set({
        nodes: applyNodeChanges(changes, get().nodes)
    })},
    onEdgesChange: (changes:EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        })
    },
    onConnect: (params:Connection) => {
        set({
            edges: addEdge(params, get().edges)
        })
    },
    addNode: (source, position)=>{
        const newNode:Node = {
            ...source,
            extent: undefined,
            parentNode: undefined,
            id: nanoid(),
            position,
            data: {
                ...source.data,
                label: 'new node'
            }
        }
        const newEdge:Edge = {
            id: nanoid(),
            target: newNode.id,
            source: source.id,
        }
        set({
            nodes: get().nodes.concat(newNode),
            edges: get().edges.concat(newEdge)
        })
    },
    showModal: false,
    setShowModal: (bool)=> set({showModal: bool}),
    modalInfo: '',
    setModalInfo: (info)=> set({modalInfo: info}),
    deleteEdge: (id) => set({edges: get().edges.filter((edge) => edge.id != id)})
}))

export default useStore;