//import net from 'net';
const net = require('net');
const socket_file_path = `/tmp/unix.sock`

// UNIXドメインソケットのコネクションを作成する
// net.createConnectionの引数にファイルを指定:UNIXドメインソケット接続
class UnixSocket {

  constructor(socketFileLocalPath) {
    
    //Create unix socket connection
    this.client = net.createConnection(socketFileLocalPath);

    //connect
    this.client.on('connect', () => {
      console.log('[unix_socket]','connected.');
    });
    
    //recieve
    this.client.on('data', (data) => {
      console.log('[unix_socket]', data.toString());
    });
    
    //disconnect
    this.client.on('end', () => {
      console.log('[unix_socket]', 'disconnected.');
    });
    
    //error socket
    this.client.on('error', (err) => {
      console.error('[unix_socket]', err.message);
    });  
  }

  //Send data
  write(data) {
    this.client.write(data);
    return data;
  }
}

//Write data using unix socket
class Writer {
  /**
   * write & connect to socket.
   * @param {String} data : JSON
   */
  async write(data) {
    let socket = null
    try {
      socket = await new UnixSocket(socket_file_path)
      socket.write(data)
    } catch(err) {
      throw new Error(err)
    } finally {
      socket = null
    }
  }
}

module.exports = {
  Writer
}

