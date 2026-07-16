const { spawn } = require('child_process');

console.log('Spawning Chrome...');
const chrome = spawn('/home/admin/.config/Antigravity/bin/google-chrome', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox'
]);

chrome.stdout.on('data', (data) => console.log(`Chrome stdout: ${data}`));
chrome.stderr.on('data', (data) => console.log(`Chrome stderr: ${data}`));

setTimeout(async () => {
  try {
    console.log('Fetching json/version from Chrome...');
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const data = await res.json();
    console.log('Success! Browser Debugger Data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to fetch from debugging port:', err);
  } finally {
    console.log('Killing Chrome...');
    chrome.kill();
    process.exit(0);
  }
}, 3000);
