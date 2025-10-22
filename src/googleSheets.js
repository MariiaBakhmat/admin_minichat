const SHEET_ID = '1Kzyw80HAzGYzX_wZcAaxo09hQQK18GXxGpRYX0RPdGc';
const API_KEY = 'api'; // Вставте ваш API ключ
const SHEET_NAME = 'admin_mini_chat_test';

export const saveNotesToSheet = async (sessionId, stage, notes) => {
  try {
    // Спочатку читаємо існуючі дані
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    const readResponse = await fetch(readUrl);
    const readData = await readResponse.json();
    
    const rows = readData.values || [['Session ID', 'Stage', 'Notes']];
    
    // Шукаємо чи є вже цей sessionId
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === sessionId) {
        rowIndex = i;
        break;
      }
    }
    
    // Якщо знайшли - оновлюємо, якщо ні - додаємо новий рядок
    if (rowIndex !== -1) {
      rows[rowIndex] = [sessionId, stage, notes];
    } else {
      rows.push([sessionId, stage, notes]);
    }
    
    // Записуємо назад
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?valueInputOption=RAW&key=${API_KEY}`;
    
    await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows
      })
    });
    
    console.log('Notes saved to Google Sheets!');
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return false;
  }
};

export const loadNotesFromSheet = async (sessionId) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const rows = data.values || [];
    
    // Шукаємо рядок з потрібним sessionId
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === sessionId) {
        return rows[i][2] || ''; // Повертаємо нотатки (колонка C)
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error loading from Google Sheets:', error);
    return '';
  }
};