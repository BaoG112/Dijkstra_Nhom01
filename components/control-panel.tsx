"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, X, AlertCircle, Network } from "lucide-react"

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

interface ControlPanelProps {
  nodes: Node[]
  edges: Edge[]
  startNode: string | null
  endNode: string | null
  isRunning: boolean
  isDirected: boolean
  onSetStartNode: (id: string | null) => void
  onSetEndNode: (id: string | null) => void
  onSetIsDirected: (isDirected: boolean) => void
  onAddNode: () => void
  onRemoveNode: (id: string) => void
  onRemoveEdge: (index: number) => void
  onAddEdge: (from: string, to: string, weight: number) => void
}

export default function ControlPanel(props: ControlPanelProps) {
  const [edgeFrom, setEdgeFrom] = useState<string | null>(null)
  const [edgeTo, setEdgeTo] = useState<string | null>(null)
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")

  const handleAddEdge = () => {
    setError("")

    if (!weight || weight === "") {
      setError("Vui lòng nhập trọng số")
      return
    }

    const weightNum = Number.parseFloat(weight)
    if (Number.isNaN(weightNum)) {
      setError("Trọng số phải là số")
      return
    }

    if (weightNum < 0) {
      setError("Cảnh báo: Trọng số âm sẽ gây lỗi trong thuật toán Dijkstra")
      return
    }

    if (edgeFrom && edgeTo && edgeFrom !== edgeTo) {
      props.onAddEdge(edgeFrom, edgeTo, weightNum)
      setEdgeFrom(null)
      setEdgeTo(null)
      setWeight("")
      setError("")
    }
  }

  const hasNegativeWeights = props.edges.some((e) => e.weight < 0)

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/50 border-slate-700 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          <Network className="w-4 h-4" />
          Loại đồ thị
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => props.onSetIsDirected(true)}
            className={`flex-1 text-sm ${
              props.isDirected
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 border border-slate-700"
            }`}
            disabled={props.isRunning}
          >
            Có hướng
          </Button>
          <Button
            onClick={() => props.onSetIsDirected(false)}
            className={`flex-1 text-sm ${
              !props.isDirected
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 border border-slate-700"
            }`}
            disabled={props.isRunning}
          >
            Vô hướng
          </Button>
        </div>
      </Card>

      {/* Nodes Section */}
      <Card className="bg-slate-900/50 border-slate-700 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          Đỉnh ({props.nodes.length})
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {props.nodes.map((node) => (
            <div key={node.id} className="flex items-center justify-between bg-slate-800/50 rounded p-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    node.id === props.startNode
                      ? "bg-cyan-500"
                      : node.id === props.endNode
                        ? "bg-pink-500"
                        : "bg-blue-500"
                  }`}
                >
                  {node.id.replace("node-", "")}
                </span>
              </div>
              <button
                onClick={() => props.onRemoveNode(node.id)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          onClick={props.onAddNode}
          className="w-full mt-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 gap-2"
          size="sm"
          disabled={props.isRunning}
        >
          <Plus className="w-4 h-4" />
          Thêm đỉnh
        </Button>
      </Card>

      {/* Start/End Selection */}
      <Card className="bg-slate-900/50 border-slate-700 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Cấu hình đường đi</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Đỉnh bắt đầu</label>
            <select
              value={props.startNode || ""}
              onChange={(e) => props.onSetStartNode(e.target.value || null)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Chọn...</option>
              {props.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  Đỉnh {n.id.replace("node-", "")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Đỉnh kết thúc</label>
            <select
              value={props.endNode || ""}
              onChange={(e) => props.onSetEndNode(e.target.value || null)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Chọn...</option>
              {props.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  Đỉnh {n.id.replace("node-", "")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Edges Section */}
      <Card className="bg-slate-900/50 border-slate-700 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          Cạnh ({props.edges.length})
        </h3>

        {hasNegativeWeights && (
          <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded p-2 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              Cảnh báo: Đồ thị có cạnh với trọng số âm. Thuật toán Dijkstra không hoạt động chính xác với trọng số âm!
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {props.edges.map((edge, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between bg-slate-800/50 rounded p-2 text-xs ${edge.weight < 0 ? "border border-red-500/30" : ""}`}
            >
              <span className="text-slate-300">
                {edge.from.replace("node-", "")} {props.isDirected ? "→" : "↔"} {edge.to.replace("node-", "")}{" "}
                <span className={`font-semibold ${edge.weight < 0 ? "text-red-400" : "text-blue-400"}`}>
                  ({edge.weight})
                </span>
              </span>
              <button onClick={() => props.onRemoveEdge(idx)} className="text-red-400 hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <select
            value={edgeFrom || ""}
            onChange={(e) => setEdgeFrom(e.target.value || null)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Từ đỉnh...</option>
            {props.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                Đỉnh {n.id.replace("node-", "")}
              </option>
            ))}
          </select>
          <select
            value={edgeTo || ""}
            onChange={(e) => setEdgeTo(e.target.value || null)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tới đỉnh...</option>
            {props.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                Đỉnh {n.id.replace("node-", "")}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            placeholder="Nhập trọng số"
          />
          {error && <p className="text-xs text-red-400 px-2">{error}</p>}
          <Button
            onClick={handleAddEdge}
            disabled={!edgeFrom || !edgeTo}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            Thêm cạnh
          </Button>
        </div>
      </Card>
    </div>
  )
}
