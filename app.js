const express = require('express');
const zod = require('zod');
const { ta } = require('zod/locales');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tasks = [{id: 1, title: "Set up environment", description: "Install Node.js, npm, and git", completed: true, createdAt: "2024-01-01T10:00:00Z"}];

app.get('/tasks', (req, res) => {
    const { sort, completed } = req.query;

    let filteredTasks = [...tasks];

    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        filteredTasks = filteredTasks.filter((t) => t.completed === isCompleted);
    }

    if (sort === 'createdAt') {
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return res.json(filteredTasks);
});

const getTaskSchema = zod.number();

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const parsedTaskId = getTaskSchema.safeParse(taskId);

    if(!parsedTaskId.success){
        return res.status(400).json({
            message: "Invalid task ID."
        });
    }

    const task = tasks.find((t) => {
        if(t.id === taskId){
            return t;
        }
    });

    if(!task){
        return res.status(404).json({
            message: "Task not found."
        });
    }

    return res.json(task);
});

const createTaskSchema = zod.object({
    title: zod.string().min(1),
    description: zod.string().min(1),
    completed: zod.boolean(),
    priority : zod.string().optional(), 
});

app.post('/tasks', (req, res) => {
    const newTask = req.body;

    const parsedNewTask = createTaskSchema.safeParse(newTask);

    if(!parsedNewTask.success){
        return res.status(400).json({
            message: "Invalid task data."
        });
    }

    newTask.id = tasks.length + 1;
    newTask.createdAt = new Date().toISOString();
    newTask.priority = newTask.priority || "normal";

    tasks.push(newTask);

    res.status(201).json({
        message: "Task created successfully."
    });
});

const updateTaskSchema = zod.object({
    title: zod.string().min(1),
    description: zod.string().min(1),
    completed: zod.boolean(),
    priority : zod.string().optional(),
});

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;

    updatedTask.priority = updatedTask.priority || "normal";

    const parsedTaskId = getTaskSchema.safeParse(taskId);
    const parsedUpdatedTask = updateTaskSchema.safeParse(updatedTask);

    if(!parsedTaskId.success || !parsedUpdatedTask.success){
        return res.status(400).json({
            message: "Invalid task ID or data."
        });
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if(taskIndex === -1){
        return res.status(404).json({
            message: "Task not found."
        });
    }

    tasks[taskIndex].title = updatedTask.title;
    tasks[taskIndex].description = updatedTask.description;
    tasks[taskIndex].completed = updatedTask.completed;
    tasks[taskIndex].priority = updatedTask.priority;

    return res.status(200).json({
        message: "Task updated successfully."
    });
});

app.delete('/tasks/:id', (req, res) => {
    const tasksId = parseInt(req.params.id);

    const parsedTaskId = getTaskSchema.safeParse(tasksId);

    if(!parsedTaskId.success){
        return res.status(400).json({
            message: "Invalid task ID."
        });
    }

    const taskIndex = tasks.findIndex((t) => t.id === tasksId);

    if(taskIndex === -1){
        return res.status(404).json({
            message: "Task not found."
        });
    }

    tasks.splice(taskIndex, 1);

    return res.status(200).json({
        message: "Task deleted successfully."
    });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});



module.exports = app;