import { useState, useCallback, useRef } from 'react';

interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export function useGraphDrag(nodes: GraphNode[]) {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const node = nodes.find(n => n.id === id);
    if (node) {
      offsetRef.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
    }
    setDraggedNode(id);
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode) return;
    const x = e.clientX - offsetRef.current.x;
    const y = e.clientY - offsetRef.current.y;
    return { id: draggedNode, x, y };
  }, [draggedNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  return { draggedNode, handleMouseDown, handleMouseMove, handleMouseUp };
}
