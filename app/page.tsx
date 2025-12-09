"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, Trash2 } from "lucide-react"
import DijkstraCanvas from "@/components/dijkstra-canvas"
import ControlPanel from "@/components/control-panel"
import ResultsPanel from "@/components/results-panel"

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

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [startNode, setStartNode] = useState<string | null>(null)
  const [endNode, setEndNode] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DijkstraResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)
  const [isDirected, setIsDirected] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const addNode = (x: number, y: number) => {
    const newNode: Node = {
      id: `node-${nodes.length}`,
      x,
      y,
    }
    setNodes([...nodes, newNode])
  }

  const addEdge = (from: string, to: string, weight: number) => {
    const newEdge: Edge = { from, to, weight }
    setEdges([...edges, newEdge])
  }

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.from !== id && e.to !== id))
    if (startNode === id) setStartNode(null)
    if (endNode === id) setEndNode(null)
  }

  const removeEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index))
  }

  const dijkstra = (start: string): DijkstraResult => {
    const distances: Record<string, number> = {}
    const visited = new Set<string>()
    const visitedOrder: string[] = []
    const previous: Record<string, string | null> = {}

    nodes.forEach((n) => {
      distances[n.id] = n.id === start ? 0 : Number.POSITIVE_INFINITY
      previous[n.id] = null
    })

    while (visited.size < nodes.length) {
      let minNode: string | null = null
      let minDist = Number.POSITIVE_INFINITY

      for (const node of nodes) {
        if (!visited.has(node.id) && distances[node.id] < minDist) {
          minNode = node.id
          minDist = distances[node.id]
        }
      }

      if (minNode === null || distances[minNode] === Number.POSITIVE_INFINITY) break

      visited.add(minNode)
      visitedOrder.push(minNode)

      for (const edge of edges) {
        const isValidEdge = isDirected ? edge.from === minNode : edge.from === minNode || edge.to === minNode
        let neighborNode: string | null = null
        if (isDirected) {
          neighborNode = edge.from === minNode ? edge.to : null
        } else {
          neighborNode = edge.from === minNode ? edge.to : edge.to === minNode ? edge.from : null
        }

        if (neighborNode && !visited.has(neighborNode)) {
          const newDist = distances[minNode] + edge.weight
          if (newDist < distances[neighborNode]) {
            distances[neighborNode] = newDist
            previous[neighborNode] = minNode
          }
        }
      }
    }

    const path: string[] = []
    if (endNode && distances[endNode] !== Number.POSITIVE_INFINITY) {
      let current: string | null = endNode
      while (current !== null) {
        path.unshift(current)
        current = previous[current]
      }
    }

    return { distances, path, visitedOrder }
  }

  const runAlgorithm = () => {
    if (!startNode) return

    setIsRunning(true)
    setAnimationStep(0)
    const result = dijkstra(startNode)
    setResults(result)
  }

  useEffect(() => {
    if (!isRunning || !results) return

    const maxSteps = results.visitedOrder.length
    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= maxSteps - 1) {
          setIsRunning(false)
          return prev
        }
        return prev + 1
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, results])

  const reset = () => {
    setIsRunning(false)
    setResults(null)
    setAnimationStep(0)
    setStartNode(null)
    setEndNode(null)
  }

  const clearAll = () => {
    setNodes([])
    setEdges([])
    setStartNode(null)
    setEndNode(null)
    setIsRunning(false)
    setResults(null)
    setAnimationStep(0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Thuật Toán Dijkstra
          </h1>
          <p className="text-slate-400 text-lg">Tìm đường đi ngắn nhất trong đồ thị một cách trực quan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="bg-slate-900/50 border-slate-700 p-0 overflow-hidden shadow-2xl">
              <DijkstraCanvas
                ref={canvasRef}
                nodes={nodes}
                edges={edges}
                startNode={startNode}
                endNode={endNode}
                results={results}
                currentStep={animationStep}
                isDirected={isDirected}
                onAddNode={addNode}
                onSelectNode={(id) => {
                  if (!startNode) setStartNode(id)
                  else if (!endNode && id !== startNode) setEndNode(id)
                  else if (id === startNode) setStartNode(null)
                  else if (id === endNode) setEndNode(null)
                  else setStartNode(id)
                }}
                onAddEdge={addEdge}
                onRemoveNode={removeNode}
                onRemoveEdge={removeEdge}
              />
            </Card>

            {results && (
              <Card className="bg-slate-900/50 border-slate-700 p-6 shadow-2xl">
                <ResultsPanel
                  results={results}
                  nodes={nodes}
                  startNode={startNode}
                  endNode={endNode}
                  animationStep={animationStep}
                />
              </Card>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={runAlgorithm}
                disabled={!startNode || isRunning}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-2 font-semibold"
              >
                <Play className="w-4 h-4" />
                Chạy
              </Button>
              <Button
                onClick={reset}
                disabled={!isRunning && !results}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2 bg-transparent"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ControlPanel
              nodes={nodes}
              edges={edges}
              startNode={startNode}
              endNode={endNode}
              isRunning={isRunning}
              isDirected={isDirected}
              onSetStartNode={setStartNode}
              onSetEndNode={setEndNode}
              onSetIsDirected={setIsDirected}
              onAddNode={() => addNode(200 + Math.random() * 200, 150 + Math.random() * 150)}
              onRemoveNode={removeNode}
              onRemoveEdge={removeEdge}
              onAddEdge={addEdge}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
