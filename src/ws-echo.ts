#!/usr/bin/env node

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { IncomingMessage } from 'node:http';

// Define the argument interface
interface Arguments {
  'port-in': number;
  'port-out': number;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('port-in', {
    alias: 'i',
    type: 'number',
    description: 'Input port to receive WebSocket messages',
    default: 8080
  })
  .option('port-out', {
    alias: 'o',
    type: 'number',
    description: 'Output port to forward WebSocket messages',
    default: 8081
  })
  .help()
  .alias('help', 'h')
  .example('$0 --port-in 8080 --port-out 8081', 'Forward messages from port 8080 to 8081')
  .example('$0 -i 3000 -o 3000', 'Echo messages on the same port 3000')
  .parseSync() as Arguments;

const portIn: number = argv['port-in'];
const portOut: number = argv['port-out'];

console.log(`🚀 Starting ws-echo...`);
console.log(`📥 Input port: ${portIn}`);
console.log(`📤 Output port: ${portOut}`);

// Store connected clients for the output server
const outClients: Set<WebSocket> = new Set();

// Create Express apps
const appIn = express();
const appOut = express();

// Create HTTP servers
const serverIn = appIn.listen(portIn, () => {
  console.log(`✅ Input server listening on port ${portIn}`);
});

const serverOut = portIn !== portOut ? appOut.listen(portOut, () => {
  console.log(`✅ Output server listening on port ${portOut}`);
}) : serverIn;

// Create WebSocket servers
const wssIn = new WebSocketServer({ server: serverIn, path: '/' });
const wssOut = portIn !== portOut ? new WebSocketServer({ server: serverOut, path: '/' }) : wssIn;

// Handle input WebSocket connections
wssIn.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const clientId = `${req.socket?.remoteAddress}:${req.socket?.remotePort}`;
  console.log(`📥 Input client connected: ${clientId}`);

  // Forward messages to output clients
  ws.on('message', (data: Buffer) => {
    const message = data.toString();
    console.log(`💬 Received message from ${clientId}: ${message}`);
    
    // Forward to all connected output clients
    let forwardedCount = 0;
    if (portIn === portOut) {
      // Same port: echo to all other clients
      wssOut.clients.forEach((client: WebSocket) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
          forwardedCount++;
        }
      });
    } else {
      // Different ports: forward to output port clients
      wssOut.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
          forwardedCount++;
        }
      });
    }
    
    console.log(`📤 Forwarded message to ${forwardedCount} output client(s)`);
  });

  ws.on('close', () => {
    console.log(`📥 Input client disconnected: ${clientId}`);
  });

  ws.on('error', (error: Error) => {
    console.error(`❌ Input client error for ${clientId}:`, error.message);
  });
});

// Handle output WebSocket connections (only if different port)
if (portIn !== portOut) {
  wssOut.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = `${req.socket?.remoteAddress}:${req.socket?.remotePort}`;
    console.log(`📤 Output client connected: ${clientId}`);
    
    outClients.add(ws);

    ws.on('close', () => {
      console.log(`📤 Output client disconnected: ${clientId}`);
      outClients.delete(ws);
    });

    ws.on('error', (error: Error) => {
      console.error(`❌ Output client error for ${clientId}:`, error.message);
      outClients.delete(ws);
    });
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down ws-echo...');
  
  serverIn.close(() => {
    console.log('✅ Input server closed');
  });
  
  if (portIn !== portOut) {
    serverOut.close(() => {
      console.log('✅ Output server closed');
    });
  }
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

console.log('\n📝 Usage:');
console.log(`   Connect input clients to:  ws://localhost:${portIn}`);
if (portIn !== portOut) {
  console.log(`   Connect output clients to: ws://localhost:${portOut}`);
} else {
  console.log(`   Same port mode: messages will be echoed to other clients on the same port`);
}
console.log('\n🔄 Ready to forward messages! Press Ctrl+C to stop.'); 