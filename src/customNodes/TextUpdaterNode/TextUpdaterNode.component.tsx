import './TextUpdaterNode.styles.css'
import {Handle, Position, NodeProps} from 'reactflow';

const TextUpdaterNode = ({data}: NodeProps) => {
    return ( <>
        <Handle type='target' position={Position.Top}></Handle>
        <div>
            <label htmlFor='text'>text:</label>
            <br />
            <input className='nodrag' defaultValue={data.label} id='text' onChange={(event)=> console.log(event.target.value)}></input>
        </div>
        <Handle id='a' type='source' position={Position.Bottom}></Handle>
        <Handle id='b' type='source' position={Position.Bottom} style={{left: 10}}></Handle>
    </> );
}

export default TextUpdaterNode;