import ISocket from '../../../engine/interfaces/net/ISocket'
import IDatagram from '../../../engine/interfaces/net/IDatagram'
import * as sv from '../../../engine/sv'
import * as net from '../../../engine/net'
import * as def from '../../../engine/def'
import * as websocket from 'websocket'
import * as httpServer from './http'
import { QConnectStatus } from '../../../engine/interfaces/net/INetworkDriver'
import * as con from '../../../engine/console'
import { Server } from 'http'

type Connection = websocket.connection & {data_socket?: ISocket}
type WebsocketState = {
	server: websocket.server,
	http: Server,
	acceptsockets: Connection[],
	colors: string[]
}
export const name = "websocket"
export var initialized = false
export var available = true
export const state: WebsocketState = {
  server: null,
  http: null,
  acceptsockets: [],
  colors: []
}

enum MESSAGE_TYPE {
	UNRELIABLE,
	RELIABLE = 1,
	ACK = 2,
}

const HEADER_SIZE = 5

const printAscii = (dec: number) => {
	if (dec && dec > 31 && dec < 126) {
		return ' ' + String.fromCharCode(dec).padStart(2, ' ')
	} else {
		return ' 0x' + dec.toString(16).padStart(2, '0')
	}
}

// for debug only
// export const byteArayToString = (bytes: ArrayBuffer) => {
// 	if (bytes[0] === 1) {
// 		return [].map.call(bytes.slice(0, 200), printAscii)
// 	} else {
// 		return [].map.call(bytes.slice(0, 200), x => x.toString(16))
// 	}
// }

// not implemented client specific functions
export const connect = async (host: string): Promise<QConnectStatus> => {
  return 'failed'
}
export const checkForResend = (): number => {
  return 0
}
export const canSendMessage = (sock: ISocket) => {
  return sock.canSend
}

export const init = function()
{
	// var palette = await com.loadFile('gfx/palette.lmp');
	// if (palette == null)
	// 	sys.error('Couldn\'t load gfx/palette.lmp');
	// var pal = new Uint8Array(palette);
	// var pal = new Uint8Array(palette), i, src = 24, c;
	// for (i = 0; i <= 13; ++i)
	// {
	// 	WEBS.colors[i] = pal[src].toString() + ',' + pal[src + 1].toString() + ',' + pal[src + 2].toString();
	// 	src += 48;
	// }

	state.server = new websocket.server;
	state.server.on('request', serverOnRequest);
	
	initialized = true

	return true;
};

export const listen = function()
{
	if (net.state.listening !== true)
	{
		state.server.unmount();
		if (state.http == null)
			return;
    state.http.close();
    state.http = null;
		return;
	}
	try
	{
    state.http = httpServer.createHttpServer(net.state.hostport)
		state.server.mount({httpServer: state.http, maxReceivedMessageSize: def.max_message});
		con.print('HTTP server listening on port ' + net.state.hostport + '\n');
	}
	catch (e)
	{
		net.state.listening = false;
		return;
	}
};

export const registerWithMaster = () => {
	return httpServer.registerWithMaster()
}

export const checkNewConnections = (): ISocket => {
	if (state.acceptsockets.length === 0)
		return;
	var sock = net.newQSocket();
	var connection = state.acceptsockets.shift();
	sock.driverdata = connection;
	sock.receiveMessage = [];
	sock.address = connection.remoteAddress;
	sock.sendMessageLength = 0
	sock.canSend = true
	sock.sendMessage = Buffer.alloc(def.max_message)
	sock.ackSequence = 0;
	sock.sendSequence = 0;
	connection.data_socket = sock;
	connection.on('message', connectionOnMessage);
	connection.on('close', connectionOnClose);
	
	return sock;
};

export const getMessage = (sock: ISocket) => {
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.closeReasonCode !== -1)
		return -1;
	
	while(sock.receiveMessage.length > 0) {
		const message = sock.receiveMessage.shift();
		const messageType = message[0];
		const sequence =  message.readUInt32BE(1)
	
		if (messageType === MESSAGE_TYPE.UNRELIABLE) {
			net.state.message.cursize = message.length - HEADER_SIZE;
			(new Uint8Array(net.state.message.data)).set(message.subarray(HEADER_SIZE));
			return 2;
		} else if (messageType === MESSAGE_TYPE.RELIABLE) {
			sock.driverdata.send(Buffer.from([
				MESSAGE_TYPE.ACK, 
				sequence >>> 24, 
				(sequence & 0xff0000) >>> 16, 
				(sequence & 0xff00) >>> 8, 
				(sequence & 0xff) >>> 0
			]));
	
			if (sequence !== sock.receiveSequence)
				continue;
			++sock.receiveSequence;
			net.state.message.cursize = message.length - HEADER_SIZE;
			(new Uint8Array(net.state.message.data)).set(message.subarray(HEADER_SIZE));	

			return 1
		} else if (messageType === MESSAGE_TYPE.ACK){
			
			if (sequence !== (sock.sendSequence - 1))
			{
				con.dPrint('Stale ACK received\n');
				continue;
			}
			if (sequence === sock.ackSequence)
			{
				if (++sock.ackSequence !== sock.sendSequence)
					con.dPrint('ack sequencing error\n');
			}
			else
			{
				con.dPrint('Duplicate ACK received\n');
				continue;
			}
			sock.sendMessageLength = 0;
			sock.canSend = true;
			continue;
		}
	}

	return 0
}

export const sendMessage = (sock: ISocket, data: IDatagram) => {
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.closeReasonCode !== -1)
		return -1;
	var i, src = new Uint8Array(data.data);
	for (i = 0; i < data.cursize; ++i)
		sock.sendMessage[i] = src[i];
	sock.sendMessageLength = data.cursize;

	var buf = Buffer.alloc(data.cursize + HEADER_SIZE);

	buf[0] = MESSAGE_TYPE.RELIABLE
	buf.writeUInt32BE(sock.sendSequence++, 1);
	sock.sendMessage.copy(buf, HEADER_SIZE, 0, data.cursize)
	sock.driverdata.sendBytes(buf);
	sock.lastSendTime = net.state.time;

	sock.canSend = false;
	return 1;
}

export const sendUnreliableMessage = (sock: ISocket, data: IDatagram) => {
	if (sock.driverdata == null)
		return -1;
	if (sock.driverdata.closeReasonCode !== -1)
		return -1;
		let src = new Uint8Array(data.data), 
			dest = Buffer.alloc(data.cursize + HEADER_SIZE);

		dest[0] = MESSAGE_TYPE.UNRELIABLE

		for (let i = 0; i < data.cursize; ++i)
			dest[i + HEADER_SIZE] = src[i];
		sock.driverdata.sendBytes(dest);

		return 1;
};

export const close = (sock: ISocket) => {
	if (sock.driverdata == null)
		return;
	if (sock.driverdata.closeReasonCode !== -1)
		return;
	sock.driverdata.drop(1000);
	sock.driverdata = null;
};

const connectionOnMessage = function(message: websocket.Message)
{
	if (message.type !== 'binary')
		return;
	if (message.binaryData.length > def.max_message)
		return;
	this.data_socket.receiveMessage.push(message.binaryData);
};

const connectionOnClose = function()
{
	net.close(this.data_socket);
};

const serverOnRequest = (request: websocket.request) => {
	if (sv.state.server.active !== true)
	{
		request.reject();
		return;
	}
	if ((net.state.activeconnections + state.acceptsockets.length) >= sv.state.svs.maxclients)
	{
		request.reject();
		return;
	}
	if (request.requestedProtocols[0] === 'quake')
	{
		state.acceptsockets.push(request.accept('quake', request.origin));
		return;
	}
};