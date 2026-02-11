"use client";

import React, { useMemo } from "react";
import ReactFlow, { Node, Edge, Position } from "reactflow";
import "reactflow/dist/style.css";
import { FaFileAlt } from "react-icons/fa";

type FileItem = {
  id: string;
  label: string;
};

export default function ResultTreeReactFlow({ files }: { files: FileItem[] }) {
  const nodes: Node[] = useMemo(() => {
    const parentNode: Node = {
      id: "parent",
      position: { x: 400, y: 50 },
      data: {
        label: (
          <div className="flex flex-col items-center text-white">
            <FaFileAlt size={50} className="text-blue-500" />
            <span className="mt-2 text-sm font-medium">Hasil Pencarian</span>
          </div>
        ),
      },
      sourcePosition: Position.Bottom,
      draggable: false,
    };

    const spacing = 180;

    const childNodes: Node[] = files.map((file, index) => ({
      id: file.id,
      position: {
        x: index * spacing,
        y: 200,
      },
      data: {
        label: (
          <div className="flex flex-col items-center text-white">
            <FaFileAlt size={40} className="text-blue-400" />
            <span className="mt-2 text-xs text-center w-[120px]">
              {file.label}
            </span>
          </div>
        ),
      },
      targetPosition: Position.Top,
      draggable: false,
    }));

    return [parentNode, ...childNodes];
  }, [files]);

  const edges: Edge[] = useMemo(() => {
    return files.map((file) => ({
      id: `edge-parent-${file.id}`,
      source: "parent",
      target: file.id,
      type: "bezier", // garis smooth
      style: {
        stroke: "#ffffff",
        strokeWidth: 2,
      },
      markerEnd: undefined,
    }));
  }, [files]);

  return (
    <div className="w-full h-[400px]">
      <ReactFlow
        className="react-flow-dark"
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        // ❌ Disable semua interaction
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        panOnScroll={false}
        preventScrolling={true}
        minZoom={1}
        maxZoom={1}
        nodeTypes={{}}
      />
    </div>
  );
}
