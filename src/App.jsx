import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectHealth,
  selectMessages,
  selectOnlineUsers,
  selectUsername,
  setDraftMessage,
  setUsername,
} from './features/chat/chatSlice.js';
import { appStarted } from './store/appActions.js';

function App() {
  const dispatch = useDispatch();
  const health = useSelector(selectHealth);
  const username = useSelector(selectUsername);
  const messages = useSelector(selectMessages);
  const onlineUsers = useSelector(selectOnlineUsers);

  useEffect(() => {
    dispatch(appStarted());
  }, [dispatch]);

  return (
    <main className="desktop">
      <section className="messenger-window" aria-label="Chat workspace">
        <header className="title-bar">
          <div className="title-left">
            <span className="app-icon" aria-hidden="true">
              C
            </span>
            <h1>Chat Application</h1>
          </div>
          <div className="window-controls" aria-hidden="true">
            <span>_</span>
            <span>[]</span>
            <span>x</span>
          </div>
        </header>

        <div className="messenger-body">
          <aside className="buddy-list" aria-label="Online users">
            <div className="profile-card">
              <label className="username-field">
                <span>Screen name</span>
                <input
                  value={username}
                  onChange={(event) => dispatch(setUsername(event.target.value))}
                  placeholder="Your name"
                />
              </label>
              <div className="server-status">
                <span className={`status-light ${health.status === 'ok' ? 'is-online' : ''}`} />
                <span>{health.status === 'ok' ? 'online' : 'connecting'}</span>
              </div>
            </div>

            <section className="buddy-group">
              <h2>Buddy List</h2>
              <ul>
                {onlineUsers.map((user) => (
                  <li key={user}>
                    <span className="buddy-dot" aria-hidden="true" />
                    {user || 'Student'}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="chat-panel" aria-label="Messages">
            <header className="chat-strip">
              <div>
                <h2>General Room</h2>
                <p>{health.realtime}</p>
              </div>
              <span className="room-badge">public</span>
            </header>

            <div className="message-list">
              {messages.map((message) => (
                <article className="message-row" key={message.id}>
                  <div className="message-meta">
                    <strong>{message.author}</strong>
                    <time>{message.time}</time>
                  </div>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>

            <form className="composer" aria-label="Message composer">
              <input
                aria-label="Message text"
                placeholder="Type a message..."
                onChange={(event) => dispatch(setDraftMessage(event.target.value))}
              />
              <button type="button" disabled>
                Send
              </button>
            </form>
          </section>
        </div>

      </section>
    </main>
  );
}

export default App;
