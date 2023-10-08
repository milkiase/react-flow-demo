import { Handle, Position } from "reactflow";

import './TriangleNode.styles.css';

const handleStyle = {}
function TriangleNode() {
    return (
        <div className="triangle-wrapper">
            <Handle id="t-s" type="source" position={Position.Right} style={handleStyle}></Handle>
            <Handle id="t-t" type="target" position={Position.Left} style={handleStyle}></Handle>
        </div>
    )
}

export default TriangleNode;