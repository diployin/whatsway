// CustomEdge.tsx - Custom Edge Component

import { BaseEdge, getStraightPath, EdgeLabelRenderer } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { CustomEdgeProps } from "./types";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  setEdges,
}: CustomEdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleDelete = () => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            background: "white",
            borderRadius: "9999px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
          onClick={handleDelete}
        >
          <Trash2 color="red" size={14} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}