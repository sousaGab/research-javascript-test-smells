// Log well beyond enough data to create 3 files
await logToTransport(transport);
await logToTransport(transport);
await logToTransport(transport);
await logToTransport(transport);
await logToTransport(transport);
await logToTransport(transport);
await logToTransport(transport);

// Wait for the last expected file
await new Promise(resolve => setTimeout(resolve, 5000));

// Should have 3 files total (maxFiles)
assertFileExists('testarchive.log');
assertFileExists('testarchive1.log');
assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3