import { Panel, useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';

import './ExportBtn.styles.css';

function exportImage(dataUrl:string) {
    const a = document.createElement('a');
    
    a.setAttribute('download', 'reactflow.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function ExportButton() {
    const { getNodes } = useReactFlow();
    const onClick = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng((document.querySelector('.react-flow__viewport') as HTMLElement), {
      backgroundColor: 'whitesmoke',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(exportImage);
  };

  return (
    <Panel position="top-right">
      <button className="export-btn " onClick={onClick}>
      <img className='icon' src="src\assets\Download.png" alt=""/>
        Save Image
      </button>
    </Panel>
  );
}

export default ExportButton;
