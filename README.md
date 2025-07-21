# ws-echo

A simple CLI tool to forward WebSocket messages between ports. Perfect for testing, development, and creating WebSocket proxies.

## Installation

### Global Installation
```bash
npm install -g ws-echo
```

### Local Development
```bash
npm install
npm link
```

### Run without Installation
```bash
npx ws-echo [options]
```

## Usage

### Basic Usage
```bash
# Forward messages from port 8080 to port 8081
ws-echo --port-in 8080 --port-out 8081

# Using short aliases
ws-echo -i 8080 -o 8081

# Echo messages on the same port (all clients receive each other's messages)
ws-echo --port-in 3000 --port-out 3000
```

### Default Behavior
If no ports are specified, the tool will:
- Use port 8080 for input
- Use port 8081 for output

```bash
# This is equivalent to: ws-echo -i 8080 -o 8081
ws-echo
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--port-in` | `-i` | Input port to receive WebSocket messages | 8080 |
| `--port-out` | `-o` | Output port to forward WebSocket messages | 8081 |
| `--help` | `-h` | Show help | |

## Examples

### 1. Message Forwarding (Different Ports)
```bash
ws-echo -i 8080 -o 8081
```
- Connect input clients to `ws://localhost:8080`
- Connect output clients to `ws://localhost:8081`
- Messages sent to port 8080 will be forwarded to all clients connected to port 8081

### 2. Message Echo (Same Port)
```bash
ws-echo -i 3000 -o 3000
```
- All clients connect to `ws://localhost:3000`
- Messages from any client are echoed to all other clients on the same port
- Perfect for chat applications or multi-client synchronization

### 3. Testing WebSocket Applications
```bash
# Terminal 1: Start the echo server
ws-echo -i 9000 -o 9001

# Terminal 2: Connect a test client to input port
wscat -c ws://localhost:9000

# Terminal 3: Connect a listener to output port
wscat -c ws://localhost:9001
```

## Use Cases

- **WebSocket Debugging**: Monitor and forward WebSocket traffic
- **Load Testing**: Broadcast messages to multiple clients
- **Development**: Create mock WebSocket servers for testing
- **Chat Applications**: Echo messages between multiple clients
- **Microservices**: Forward WebSocket messages between services

## Features

- ✅ Supports multiple concurrent connections
- ✅ Real-time message forwarding
- ✅ Same-port echo mode
- ✅ Graceful shutdown handling
- ✅ Detailed connection logging
- ✅ Error handling and recovery
- ✅ Cross-platform compatibility

## Output Example

```
🚀 Starting ws-echo...
📥 Input port: 8080
📤 Output port: 8081
✅ Input server listening on port 8080
✅ Output server listening on port 8081

📝 Usage:
   Connect input clients to:  ws://localhost:8080
   Connect output clients to: ws://localhost:8081

🔄 Ready to forward messages! Press Ctrl+C to stop.

📥 Input client connected: ::1:51234
📤 Output client connected: ::1:51235
💬 Received message from ::1:51234: Hello World!
📤 Forwarded message to 1 output client(s)
```

## Requirements

- Node.js >= 14.0.0
- npm or yarn

## Dependencies

- `express`: HTTP server framework
- `ws`: WebSocket library
- `yargs`: Command line argument parsing

## License

MIT 