from fastapi import APIRouter, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import joinedload

from app.api.deps import DBDep, CurrentUserDep
from app.models.task_model import (
    Task,
    TaskCreate,
    TaskRead,
    TaskUpdate,
    TaskReorder,
    TaskStatus,
)


router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=TaskRead,
    operation_id="createTask",
)
def create_task(
    task_in: TaskCreate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> TaskRead:
    """Create a new task."""
    # Get max order for this project and status
    max_order = db.exec(
        select(Task.order)
        .where(Task.project_id == task_in.project_id)
        .where(Task.status == task_in.status)
        .order_by(Task.order.desc())  # pyright: ignore[reportAttributeAccessIssue]
    ).first()

    new_order = (max_order or 0) + 1

    task = Task(
        org_id=current_user.org_id,
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        order=new_order,
        estimated_hours=task_in.estimated_hours,
        assignee_id=task_in.assignee_id,
    )
    db.add(task)
    db.commit()

    # Reload with relationships
    result = db.exec(
        select(Task).where(Task.id == task.id).options(joinedload(Task.assignee))  # pyright: ignore[reportArgumentType]
    ).first()

    return result  # pyright: ignore[reportReturnType]


@router.get("/", response_model=list[TaskRead], operation_id="readTasks")
def read_tasks(
    current_user: CurrentUserDep,
    db: DBDep,
    project_id: int | None = None,
    status: TaskStatus | None = None,
    offset: int = 0,
    limit: int = 100,
) -> list[TaskRead]:
    """Retrieve tasks, optionally filtered by project or status."""
    query = (
        select(Task)
        .where(Task.org_id == current_user.org_id)
        .options(joinedload(Task.assignee))  # pyright: ignore[reportArgumentType]
        .order_by(Task.status, Task.order)
    )

    if project_id:
        query = query.where(Task.project_id == project_id)
    if status:
        query = query.where(Task.status == status)

    tasks = db.exec(query.offset(offset).limit(limit)).unique().all()
    return tasks  # pyright: ignore[reportReturnType]


@router.get("/{task_id}", response_model=TaskRead, operation_id="readTask")
def read_task(
    task_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> TaskRead:
    """Get a specific task by ID."""
    task = db.exec(
        select(Task).where(Task.id == task_id).options(joinedload(Task.assignee))  # pyright: ignore[reportArgumentType]
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return task  # pyright: ignore[reportReturnType]


@router.patch("/{task_id}", response_model=TaskRead, operation_id="updateTask")
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: CurrentUserDep,
    db: DBDep,
) -> TaskRead:
    """Update a task."""
    task = db.exec(
        select(Task).where(Task.id == task_id).options(joinedload(Task.assignee))  # pyright: ignore[reportArgumentType]
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = task_in.model_dump(exclude_unset=True)
    task.sqlmodel_update(update_data)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task  # pyright: ignore[reportReturnType]


@router.patch("/{task_id}/reorder", response_model=TaskRead, operation_id="reorderTask")
def reorder_task(
    task_id: int,
    reorder_in: TaskReorder,
    current_user: CurrentUserDep,
    db: DBDep,
) -> TaskRead:
    """
    Reorder a task within a column or move to a different column.
    Updates the task's status and order position.
    """
    task = db.exec(
        select(Task).where(Task.id == task_id).options(joinedload(Task.assignee))  # pyright: ignore[reportArgumentType]
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    old_status = task.status
    new_status = reorder_in.status
    new_order = reorder_in.order

    # If moving to a different column, shift orders in both columns
    if old_status != new_status:
        # Shift down tasks in the old column that were after this task
        tasks_to_shift_down = db.exec(
            select(Task)
            .where(Task.project_id == task.project_id)
            .where(Task.status == old_status)
            .where(Task.order > task.order)
        ).all()
        for t in tasks_to_shift_down:
            t.order -= 1
            db.add(t)

        # Shift up tasks in the new column to make room
        tasks_to_shift_up = db.exec(
            select(Task)
            .where(Task.project_id == task.project_id)
            .where(Task.status == new_status)
            .where(Task.order >= new_order)
        ).all()
        for t in tasks_to_shift_up:
            t.order += 1
            db.add(t)
    else:
        # Moving within the same column
        if new_order > task.order:
            # Moving down - shift tasks between old and new position up
            tasks_to_shift = db.exec(
                select(Task)
                .where(Task.project_id == task.project_id)
                .where(Task.status == task.status)
                .where(Task.order > task.order)
                .where(Task.order <= new_order)
            ).all()
            for t in tasks_to_shift:
                t.order -= 1
                db.add(t)
        elif new_order < task.order:
            # Moving up - shift tasks between new and old position down
            tasks_to_shift = db.exec(
                select(Task)
                .where(Task.project_id == task.project_id)
                .where(Task.status == task.status)
                .where(Task.order >= new_order)
                .where(Task.order < task.order)
            ).all()
            for t in tasks_to_shift:
                t.order += 1
                db.add(t)

    task.status = new_status
    task.order = new_order
    db.add(task)
    db.commit()
    db.refresh(task)

    return task  # pyright: ignore[reportReturnType]


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    operation_id="deleteTask",
)
def delete_task(
    task_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
) -> None:
    """Delete a task."""
    task = db.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Shift down orders for tasks after this one
    tasks_to_shift = db.exec(
        select(Task)
        .where(Task.project_id == task.project_id)
        .where(Task.status == task.status)
        .where(Task.order > task.order)
    ).all()
    for t in tasks_to_shift:
        t.order -= 1
        db.add(t)

    db.delete(task)
    db.commit()
