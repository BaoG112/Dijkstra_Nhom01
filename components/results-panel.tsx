"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Route, XCircle, Zap } from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
}

interface DijkstraResult {
  distances: Record<string, number>
  path: string[]
  visitedOrder: string[]
}

interface ResultsPanelProps {
  results: DijkstraResult
  nodes: Node[]
  startNode: string | null
  endNode: string | null
  animationStep: number
}

export default function ResultsPanel(props: ResultsPanelProps) {
  const shortestDistance = props.endNode ? props.results.distances[props.endNode] : Number.POSITIVE_INFINITY

  const pathFound = props.results.path.length > 0 && shortestDistance !== Number.POSITIVE_INFINITY

  const visitedUpToStep = props.results.visitedOrder.slice(0, props.animationStep + 1)

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
        {pathFound ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
        Kết quả
      </h3>

      <div className="space-y-3">
        <div
          className={`rounded p-3 border ${pathFound ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}
        >
          <p className={`text-sm font-semibold ${pathFound ? "text-green-400" : "text-red-400"}`}>
            {pathFound
              ? `✓ Tìm được đường đi ngắn nhất`
              : `✗ Không tìm được đường đi từ ${props.startNode?.replace("node-", "")} đến ${props.endNode?.replace("node-", "")}`}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded p-3 border border-yellow-500/20">
          <p className="text-xs text-slate-400 mb-2 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            Thứ tự duyệt ({visitedUpToStep.length}/{props.results.visitedOrder.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {props.results.visitedOrder.map((id, idx) => (
              <div
                key={id}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  idx <= props.animationStep
                    ? "bg-blue-500/40 text-blue-300 border border-blue-400/60"
                    : "bg-slate-700/30 text-slate-500 border border-slate-600/30"
                }`}
              >
                {id.replace("node-", "")}
              </div>
            ))}
          </div>
        </div>

        {pathFound && (
          <div className="bg-slate-800/50 rounded p-3 border border-purple-500/20">
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Route className="w-3 h-3" />
              Đường đi ngắn nhất
            </p>
            <p className="text-sm font-mono text-purple-400">
              {props.results.path.map((id) => id.replace("node-", "")).join(" → ")}
            </p>
            {shortestDistance !== Number.POSITIVE_INFINITY && (
              <p className="text-xs text-slate-400 mt-1">
                Khoảng cách: <span className="text-purple-300 font-semibold">{shortestDistance}</span>
              </p>
            )}
          </div>
        )}

        {/* All Distances */}
        <div className="bg-slate-800/50 rounded p-3 border border-blue-500/20">
          <p className="text-xs text-slate-400 mb-2 font-semibold">Khoảng cách tới tất cả đỉnh</p>
          <div className="space-y-1 text-xs">
            {props.nodes.map((node) => (
              <div key={node.id} className="flex justify-between items-center">
                <span className="text-slate-300">Đỉnh {node.id.replace("node-", "")}:</span>
                <span
                  className={
                    props.results.distances[node.id] === Number.POSITIVE_INFINITY
                      ? "text-red-400"
                      : "text-blue-400 font-semibold"
                  }
                >
                  {props.results.distances[node.id] === Number.POSITIVE_INFINITY
                    ? "∞"
                    : props.results.distances[node.id]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
