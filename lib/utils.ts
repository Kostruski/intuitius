import {
  CoreMessage,
  CoreToolMessage,
  generateId,
  Message,
  ToolInvocation,
} from 'ai';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Chat } from '@/db/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    console.log('Fetch error', error);

    throw error;
  }

  console.log('Fetch res', res.json());
  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateId(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function getTitleFromChat(chat: Chat) {
  const messages = convertToUIMessages(chat.messages as Array<CoreMessage>);
  const firstMessage = messages[0];

  if (!firstMessage) {
    return 'Untitled';
  }

  return firstMessage.content;
}

export const postToken = async (token: string) => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: token }),
    });

    if (response.ok) {
      console.log('Login successful');
      // Redirect or update UI
    } else {
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

export const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth', {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Logout successful');
      // Redirect or update UI
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export type RegisterProps = {
  idToken: string;
  companyName: string;
  userName: string;
  role?: 'user' | 'manager';
};

export const handleUserRegister = async (registerProps: RegisterProps) => {
  const { idToken, companyName, userName, role = 'user' } = registerProps;

  if (!idToken) {
    console.error('Token is required');
    return;
  }

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, companyName, userName, role }),
    });

    if (response.ok) {
      console.log('Register successful');
      return response;
    } else {
      console.error('Register failed');
    }
  } catch (error) {
    console.error('Register error:', error);
  }
};
