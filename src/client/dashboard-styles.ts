export default `
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: #2c2c2e; /* Dark background for the list */
    border-radius: 8px;
    overflow: hidden;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #444;
    color: #fff; /* Text color */
  }

  li a {
    color: #97ccf8; /* Accent color for links */
    text-decoration: none;
  }

  li a:hover {
    text-decoration: underline;
  }

  button {
    background-color: #3c3a43; /* Button background */
    border: none;
    color: #fff; /* Button text color */
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #4d5974; /* Button hover background */
  }

  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #97ccf8; /* Focus outline */
  }

  li:last-child {
    border-bottom: none;
  }

  ul button {
    margin-left: 10px;
  }

  button.create {
    background-color: #66a9e1;
    padding: 10px 15px;
    width: 100%;
    border-radius: 0 0 8px 8px;
    font-weight: bold;
  }

  button.create:hover {
    background-color: #3c3a43;
  }
`