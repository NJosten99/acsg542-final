/*
 *I attempted to utilize the username associated with the logged in user's gmail
 *but ran into the issue of using React hooks in a class.  Since such hooks
 *require a function I attempted to turn the hook into a render prop, but that
 *venture proved fruitless.  Therefore, I kept your username input demonstration
 *prerequisite feature as a matter of balancing time with web app usability.
 */
import Head from 'next/head';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// This import pertains to the socket.io tool
import io from 'socket.io-client';

// This import pertains to google cloud login api
import withAuth from '../lib/withAuth';

let socket;

const propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  user: null,
};

// eslint-disable-next-line react/prefer-stateless-function
function Index() {
  const [username, setUsername] = useState('');
  const [chosenUsername, setChosenUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io();

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('messageToBeDisplayed', (msg) => {
      setMessages((currentMessage) => [
        ...currentMessage,
        { author: msg.author, message: msg.message, time: msg.time },
      ]);
    });
  };

  const sendMessage = async () => {
    socket.emit(
      'messageToPropogate',
      { author: chosenUsername, message },
      { time: `${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}` },
    );
    setMessages((currentMsg) => [
      ...currentMsg,
      { author: chosenUsername, message },
      { time: `Sent at: ${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}` },
    ]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.keycode === 13) {
      if (message) {
        sendMessage();
      }
    }
  };

  useEffect(() => {
    socketInitializer();
    return () => {
      console.log('This will be logged on unmount');
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Town^2</title>
        <meta
          name="description"
          content="This is a messaging app titled Town^2 (See what I did there ;D)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 style={{ fontSize: '90px', fontWeight: '700' }}>Town^2</h1>
      <line-style>
        <main
          style={{
            border: 'solid',
            textAlign: 'center',
            margin: 'auto',
            fontSize: '44px',
            fontWeight: '400',
          }}
        >
          {!chosenUsername ? (
            <>
              <h3>Choose your username:</h3>
              <input
                type="text"
                style={{ fontSize: '30px' }}
                placeholder="*Enter Username*"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="button"
                style={{ fontSize: '30px' }}
                onClick={() => {
                  setChosenUsername(username);
                }}
              >
                Submit
              </button>
            </>
          ) : (
            <>
              <p>Your username: {username}</p>
              <line-style>
                {messages.map((msg, i) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i}>
                      {msg.author} : {msg.message} {msg.time}
                    </div>
                  );
                })}
              </line-style>
              <input
                type="text"
                style={{ fontSize: '30px' }}
                placeholder="*Enter Message*"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={handleKeyPress}
              />
              <button
                type="button"
                style={{ fontSize: '30px' }}
                onClick={() => {
                  sendMessage();
                }}
              >
                Send
              </button>
            </>
          )}
        </main>
      </line-style>
    </div>
  );
}

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;

export default withAuth(Index);
