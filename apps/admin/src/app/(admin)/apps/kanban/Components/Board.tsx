'use client'

import { useKanbanContext } from '@/context/useKanbanContext'
import { Card } from 'react-bootstrap'
import TaskItem from './TaskItem'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const Board = () => {
  const { sections, getAllTasksPerSection } = useKanbanContext()

  return (
    <div className="board">
      {sections.map((section) => (
        <div
          key={section.id}
          className="tasks pt-2 border-0"
          data-plugin="dragula"
          data-containers='["task-list-one", "task-list-two", "task-list-three", "task-list-four"]'>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              In {section.title} ({getAllTasksPerSection(section.id).length})
            </h4>
            <span className="badge border text-dark">
              <IconifyIcon icon="mdi:plus" className="fs-18" />
            </span>
          </div>
          <div id="task-list-one" className="task-list-items">
            {getAllTasksPerSection(section.id).map((task) => (
              <Card key={task.id}>
                <TaskItem task={task} />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
export default Board
