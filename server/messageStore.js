import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const memoryMessages = [];

export const storageMode = supabase ? 'supabase' : 'memory';

function formatTime(value) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function toClientMessage(row) {
  return {
    id: row.id,
    author: row.author,
    text: row.content ?? row.text,
    time: formatTime(row.created_at ?? row.createdAt),
  };
}

function rememberMessage(message) {
  memoryMessages.push(message);

  if (memoryMessages.length > 50) {
    memoryMessages.shift();
  }
}

export async function listRecentMessages(limit = 30) {
  if (!supabase) {
    return memoryMessages.slice(-limit).map(toClientMessage);
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, author, content, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return memoryMessages.slice(-limit).map(toClientMessage);
  }

  return data.reverse().map(toClientMessage);
}

export async function saveMessage(message) {
  const record = {
    id: message.id,
    author: message.author,
    content: message.text,
    created_at: message.createdAt,
  };

  if (!supabase) {
    rememberMessage(record);
    return toClientMessage(record);
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(record)
    .select('id, author, content, created_at')
    .single();

  if (error) {
    rememberMessage(record);
    return toClientMessage(record);
  }

  return toClientMessage(data);
}
