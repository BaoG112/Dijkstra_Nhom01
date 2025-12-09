"use client"

import React, { useRef, useEffect, useState } from "react"

interface Node {
  id: string
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
  weight: number
}

interface DijkstraResult {
  distances: Record<string, number>
  path: string[]
  visitedOrder: string[]
}

interface DijkstraCanvasProps {
  nodes: Node[]
  edges: Edge[]
  startNode: string | null
  endNode: string | null
  results: DijkstraResult | null
  currentStep: number
  isDirected: boolean
  onAddNode: (x: number, y: number) => void
  onSelectNode: (id: string) => void
  onAddEdge: (from: string, to: string, weight: number) => void
  onRemoveNode: (id: string) => void
  onRemoveEdge: (index: number) => void
}

const DijkstraCanvas = React.forwardRef<HTMLCanvasElement, DijkstraCanvasProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headlen = 15
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Adjust arrow start to be at node edge
    const fromDist = 20
    const adjustedFromX = fromX + Math.cos(angle) * fromDist
    const adjustedFromY = fromY + Math.sin(angle) * fromDist

    // Adjust arrow end to be at node edge
    const toDist = 20
    const adjustedToX = toX - Math.cos(angle) * toDist
    const adjustedToY = toY - Math.sin(angle) * toDist

    // Draw arrow line
    ctx.beginPath()
    ctx.moveTo(adjustedFromX, adjustedFromY)
    ctx.lineTo(adjustedToX, adjustedToY)
    ctx.stroke()

    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(adjustedToX, adjustedToY)
    ctx.lineTo(
      adjustedToX - headlen * Math.cos(angle - Math.PI / 6),
      adjustedToY - headlen * Math.sin(angle - Math.PI / 6),
    )
    ctx.lineTo(
      adjustedToX - headlen * Math.cos(angle + Math.PI / 6),
      adjustedToY - headlen * Math.sin(angle + Math.PI / 6),
    )
    ctx.closePath()
    ctx.fill()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    props.edges.forEach((edge, index) => {
      const fromNode = props.nodes.find((n) => n.id === edge.from)
      const toNode = props.nodes.find((n) => n.id === edge.to)
      if (!fromNode || !toNode) return

      const isInPath = props.results?.path.includes(edge.from) && props.results?.path.includes(edge.to)

      if (isInPath) {
        ctx.strokeStyle = "#a855f7"
        ctx.lineWidth = 3
        ctx.fillStyle = "#a855f7"
      } else {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.fillStyle = "#3b82f6"
      }

      if (props.isDirected) {
        // Draw directed edge with arrow
        drawArrow(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y)
      } else {
        // Draw undirected edge as simple line
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.stroke()
      }

      // Draw weight label
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2
      ctx.fillStyle = "#e0e7ff"
      ctx.font = "bold 13px Geist"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(edge.weight.toString(), midX, midY - 10)
    })

    props.nodes.forEach((node) => {
      const isStart = node.id === props.startNode
      const isEnd = node.id === props.endNode
      const visitedUpToStep = props.results?.visitedOrder.slice(0, props.currentStep + 1) || []
      const isVisited = visitedUpToStep.includes(node.id)
      const isCurrentStep = props.results?.visitedOrder[props.currentStep] === node.id
      const isInPath = props.results?.path.includes(node.id)

      let fillColor = "#1e293b"
      if (isStart) {
        fillColor = "#06b6d4"
      } else if (isEnd) {
        fillColor = "#ec4899"
      } else if (isCurrentStep) {
        fillColor = "#fbbf24"
      } else if (isInPath) {
        fillColor = "#a855f7"
      } else if (isVisited) {
        fillColor = "#3b82f6"
      }

      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = node.id === hoveredNode ? "#fbbf24" : "#cbd5e1"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = "#0f172a"
      ctx.font = "bold 14px Geist"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const label = node.id.replace("node-", "")
      ctx.fillText(label, node.x, node.y)
    })
  }, [
    props.nodes,
    props.edges,
    props.startNode,
    props.endNode,
    props.results,
    props.currentStep,
    hoveredNode,
    props.isDirected,
  ])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = props.nodes.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2)
      return dist < 20
    })

    if (clickedNode) {
      props.onSelectNode(clickedNode.id)
      setSelectedNode(clickedNode.id)
    } else {
      props.onAddNode(x, y)
      setSelectedNode(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = props.nodes.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2)
      return dist < 20
    })

    setHoveredNode(hovered?.id || null)
    canvas.style.cursor = hovered ? "pointer" : "crosshair"
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        className="w-full h-96 md:h-[500px] block"
      />
      <div className="bg-slate-900/50 border-t border-slate-700 p-3 text-xs text-slate-400">
        <p>💡 Click để tạo đỉnh • Nhập cạnh từ bảng điều khiển • Chọn đỉnh để đánh dấu bắt đầu/kết thúc</p>
      </div>
    </div>
  )
})

DijkstraCanvas.displayName = "DijkstraCanvas"

export default DijkstraCanvas
