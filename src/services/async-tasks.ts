import pool from '../db';
import { ingestArticle } from './ingest-article';

export interface Task {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputData: any;
  resultData?: any;
  errorMessage?: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function createTask(type: string, inputData: any): Promise<string> {
  const taskId = generateTaskId();
  
  await pool.query(
    'INSERT INTO tasks (id, type, input_data) VALUES ($1, $2, $3)',
    [taskId, type, JSON.stringify(inputData)]
  );
  
  // Start processing in background
  processTaskAsync(taskId).catch(console.error);
  
  return taskId;
}

export async function getTask(taskId: string): Promise<Task | null> {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE id = $1',
    [taskId]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    inputData: row.input_data,
    resultData: row.result_data,
    errorMessage: row.error_message,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
}

async function updateTaskProgress(taskId: string, progress: number, status?: string) {
  const updates = ['progress = $2', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [taskId, progress];
  
  if (status) {
    updates.push('status = $3');
    values.push(status);
  }
  
  await pool.query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = $1`,
    values
  );
}

async function processTaskAsync(taskId: string) {
  try {
    await updateTaskProgress(taskId, 0, 'processing');
    
    const task = await getTask(taskId);
    if (!task) return;
    
    if (task.type === 'ingest-article') {
      await updateTaskProgress(taskId, 10);
      
      const result = await ingestArticle(
        task.inputData.url,
        task.inputData.symbol,
        undefined, // rssItem
        'apify', // method
        task.inputData.content,
        task.inputData.title
      );
      
      await updateTaskProgress(taskId, 90);
      
      await pool.query(
        'UPDATE tasks SET status = $1, result_data = $2, progress = $3, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        ['completed', JSON.stringify(result), 100, taskId]
      );
    }
  } catch (error: any) {
    await pool.query(
      'UPDATE tasks SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['failed', error.message, taskId]
    );
  }
}
