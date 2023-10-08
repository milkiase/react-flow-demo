import { useCallback, MouseEvent, useState} from "react";
import { EdgeProps, BaseEdge, getStraightPath, EdgeLabelRenderer} from "reactflow";
import useStore from "../../../store/store";

import './DeleteBtnEdge.styles.css'

const DeleteBtnEdge = ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd}: EdgeProps) => {
    const {deleteEdge} = useStore((state) => ({deleteEdge: state.deleteEdge}))
    const [isHovering, setIsHovering] = useState(false)
    const handleDelete = useCallback((event:MouseEvent) => {
        event.stopPropagation();
        deleteEdge(id)
    }, [])
    const mouseEnterHandler = () => setIsHovering(true)
    const mouseLeaveHandler = () => setIsHovering(false)
    const [edgePath, labelX, labelY] = getStraightPath({sourceX, sourceY, targetX, targetY})

    return (
    <>
        <g onMouseEnter={mouseEnterHandler}
            onMouseLeave={mouseLeaveHandler}>
            <BaseEdge path={edgePath} style={{...style, stroke: isHovering ? '#F6AD55' : undefined}} markerEnd={markerEnd}></BaseEdge>
        </g>
        <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    fontSize: 12,
                    // everything inside EdgeLabelRenderer has no pointer events by default
                    // if you have an interactive element, set pointer-events: all
                    pointerEvents: 'all',
                    display: isHovering ? 'block': 'none',
                }}
                className="nodrag nopan"
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
            >
                <button className="edgebutton" onClick={handleDelete}>
                    ×
                </button>
            </div>
        </EdgeLabelRenderer>
    </>
    );
};

export default DeleteBtnEdge;