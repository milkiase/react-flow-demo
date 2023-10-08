import './TextUpdaterNode.styles.css';
import {Handle, Position, NodeProps} from 'reactflow';

const TextUpdaterNode = ({data}: NodeProps) => {
    return ( <>
        <Handle type='target' position={Position.Left}></Handle>
        <div>
            <label htmlFor='text'>text:</label>
            <br />
            <input className='nodrag' defaultValue={data.label} id='text' onChange={(event)=> console.log(event.target.value)}></input>
        </div>
        <Handle id='a' type='source' position={Position.Top} style={{left: 95}}></Handle>
        <Handle id='b' type='source' position={Position.Top} style={{left: 45}}></Handle>
    </> );
}

export default TextUpdaterNode;