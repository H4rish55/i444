// run from project base directory

const CMD = './dist/index.js';
const DB = 'mongodb://localhost:27017/chats';

export default [
  {
    comment: 'clear out all data',
    cmd: CMD,
    args: [ DB, 'clear' ],
  },
  { comment: 'add a user',
    args: [ DB, 'add-user',
	    'first-name=john', 'last-name=smith',
	    'chat-name=jsmith', 'email=jsmith@zz.com',
	  ],
    envSet: { envVar: 'userId', parser: 'json', path: 'id' },
  },

];
