import { randomUUID } from 'expo-crypto';
import { getDatabase } from './database';

export interface ListItem {
  id: string;
  name: string;
  is_system: boolean;
  is_show: boolean;
  position: number;
}

export interface CreateListData {
  name: string;
  is_system?: boolean;
  is_show?: boolean;
  position?: number;
}

async function initializeListsTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      is_show BOOLEAN NOT NULL DEFAULT TRUE,
      position INTEGER NOT NULL
    );
  `);
}

// Get the next available position for a new list
async function getNextPosition(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getAllAsync<{maxPosition: number | null}>(
    `SELECT MAX(position) as maxPosition FROM lists`
  );
  const maxPosition = result[0]?.maxPosition;
  return maxPosition !== null && maxPosition !== undefined ? maxPosition + 1 : 0;
}

export async function getAllLists(): Promise<ListItem[]> {
  const db = await getDatabase();
  await initializeListsTable();
  return await db.getAllAsync(
    `SELECT * FROM lists ORDER BY position ASC, name ASC`
  );
}

export async function createList(data: CreateListData): Promise<ListItem> {
  const db = await getDatabase();
  await initializeListsTable();
  
  const id = randomUUID();
  const position = data.position !== undefined ? data.position : await getNextPosition();
  
  await db.runAsync(
    `INSERT INTO lists (id, name, is_system, is_show, position) VALUES (?, ?, ?, ?, ?)`,
    [id, data.name, data.is_system || false, data.is_show || true, position]
  );
  
  return {
    id, 
    name: data.name, 
    is_system: data.is_system || false, 
    is_show: data.is_show || true, 
    position
  };
}

// Reorder lists by swapping positions
export async function swapListPositions(id1: string, id2: string): Promise<void> {
  const db = await getDatabase();
  await initializeListsTable();
  
  // Get current positions
  const list1 = await db.getAllAsync<{position: number}>(`SELECT position FROM lists WHERE id = ?`, [id1]);
  const list2 = await db.getAllAsync<{position: number}>(`SELECT position FROM lists WHERE id = ?`, [id2]);
  
  if (list1.length === 0 || list2.length === 0) return;
  
  const pos1 = list1[0].position;
  const pos2 = list2[0].position;
  
  // Swap positions
  await db.runAsync(`UPDATE lists SET position = ? WHERE id = ?`, [pos2, id1]);
  await db.runAsync(`UPDATE lists SET position = ? WHERE id = ?`, [pos1, id2]);
}

// Move list to specific position and reorder others
export async function moveListToPosition(id: string, targetPosition: number): Promise<void> {
  const db = await getDatabase();
  await initializeListsTable();
  
  // Get current position of the list
  const currentList = await db.getAllAsync<{position: number}>(`SELECT position FROM lists WHERE id = ?`, [id]);
  if (currentList.length === 0) return;
  
  const currentPosition = currentList[0].position;
  
  if (currentPosition === targetPosition) return; // No change needed
  
  if (currentPosition < targetPosition) {
    // Moving down: shift lists between current and target positions up by 1
    await db.runAsync(
      `UPDATE lists SET position = position - 1 WHERE position > ? AND position <= ?`,
      [currentPosition, targetPosition]
    );
  } else {
    // Moving up: shift lists between target and current positions down by 1
    await db.runAsync(
      `UPDATE lists SET position = position + 1 WHERE position >= ? AND position < ?`,
      [targetPosition, currentPosition]
    );
  }
  
  // Set the target list to the target position
  await db.runAsync(`UPDATE lists SET position = ? WHERE id = ?`, [targetPosition, id]);
}

// Reorder all lists to have sequential positions (0, 1, 2, 3...)
export async function reorderAllLists(): Promise<void> {
  const db = await getDatabase();
  await initializeListsTable();
  
  const lists = await db.getAllAsync<{id: string}>(`SELECT id FROM lists ORDER BY position ASC, name ASC`);
  
  for (let i = 0; i < lists.length; i++) {
    await db.runAsync(`UPDATE lists SET position = ? WHERE id = ?`, [i, lists[i].id]);
  }
}

export async function deleteListById(ids: string | string[]): Promise<void> {
  const db = await getDatabase();
  await initializeListsTable();
  
  if (Array.isArray(ids)) {
    // Delete multiple lists by IDs
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM lists WHERE id IN (${placeholders})`,
      ids   
    );
  } else {
    // Delete single list by ID
    await db.runAsync(`DELETE FROM lists WHERE id = ?`, [ids]);
  }
  
  // Reorder remaining lists to fill gaps
  await reorderAllLists();
}

export async function deleteListByName(names: string | string[]): Promise<void> {
  const db = await getDatabase();
  await initializeListsTable();
  
  if (Array.isArray(names)) {
    // Delete multiple lists by names
    if (names.length === 0) return;
    const placeholders = names.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM lists WHERE name IN (${placeholders})`,
      names
    );
  } else {
    // Delete single list by name
    await db.runAsync(`DELETE FROM lists WHERE name = ?`, [names]);
  }
  
  // Reorder remaining lists to fill gaps
  await reorderAllLists();
}





