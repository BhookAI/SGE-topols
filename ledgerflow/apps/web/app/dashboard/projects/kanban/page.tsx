'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, MoreHorizontal, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: string
  dueDate?: string
  tags?: string[]
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      { id: '1', title: 'Diseño de logo', priority: 'medium', tags: ['diseño'] },
      { id: '2', title: 'Investigación de mercado', priority: 'low', tags: ['research'] },
    ],
  },
  {
    id: 'todo',
    title: 'Por Hacer',
    tasks: [
      { id: '3', title: 'Setup del proyecto', priority: 'high', assignee: 'JP', dueDate: '2024-01-20' },
    ],
  },
  {
    id: 'in_progress',
    title: 'En Progreso',
    tasks: [
      { id: '4', title: 'Desarrollo frontend', priority: 'high', assignee: 'MR', dueDate: '2024-01-25', tags: ['dev'] },
    ],
  },
  {
    id: 'review',
    title: 'Revisión',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Completado',
    tasks: [
      { id: '5', title: 'Kickoff meeting', priority: 'medium', assignee: 'JP' },
    ],
  },
]

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-orange-500/20 text-orange-300',
  urgent: 'bg-red-500/20 text-red-300',
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)

  function onDragEnd(result: DropResult) {
    if (!result.destination) return

    const { source, destination } = result

    // If dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    // Find source and destination columns
    const sourceCol = columns.find((c) => c.id === source.droppableId)
    const destCol = columns.find((c) => c.id === destination.droppableId)

    if (!sourceCol || !destCol) return

    // Get the task being moved
    const [movedTask] = sourceCol.tasks.splice(source.index, 1)

    // Add to destination
    destCol.tasks.splice(destination.index, 0, movedTask)

    // Update state
    setColumns([...columns])

    toast.success(`Tarea movida a ${destCol.title}`)
  }

  function addTask(columnId: string) {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'Nueva tarea',
      priority: 'medium',
    }

    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestiona las tareas del proyecto con drag & drop
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
            >
              <div className="glass-card rounded-xl">
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar columna</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">
                        Eliminar columna
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        {column.tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-[var(--bg-tertiary)] border-white/5 cursor-grab active:cursor-grabbing transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/50' : ''
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge
                                      variant="secondary"
                                      className={priorityColors[task.priority]}
                                    >
                                      {task.priority}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 -mr-2 -mt-2"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400">
                                          Eliminar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <h4 className="font-medium text-white mb-1">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                      {task.assignee && (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-medium">
                                          {task.assignee}
                                        </div>
                                      )}
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                          <Calendar className="h-3 w-3" />
                                          {task.dueDate}
                                        </div>
                                      )}
                                    </div>
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex gap-1">
                                        {task.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}

                      {/* Add Task Button */}
                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                        onClick={() => addTask(column.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir tarea
                      </Button>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
