document.getElementById('test-btn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Testing connection...';
  status.className = '';
  
  try {
    const result = await window.magicLantern.testConnection();
    status.innerHTML = `
      <strong>✅ Connection successful!</strong><br>
      Version: ${result.version}<br>
      Available profiles: ${result.profiles.join(', ')}
    `;
    status.className = 'success';
  } catch (error) {
    status.textContent = '❌ Connection failed: ' + error.message;
    status.className = 'error';
  }
});

// Check if magicLantern API is available
console.log('magicLantern API available?', window.magicLantern);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  const testBtn = document.getElementById('test-btn');
  console.log('Test button found?', testBtn);
  
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      console.log('Button clicked!');
      
      const status = document.getElementById('status');
      status.textContent = 'Testing connection...';
      status.className = '';
      
      try {
        const result = await window.magicLantern.testConnection();
        console.log('Test result:', result);
        
        status.innerHTML = `
          <strong>✅ Connection successful!</strong><br>
          Version: ${result.version}<br>
          Available profiles: ${result.profiles.join(', ')}
        `;
        status.className = 'success';
      } catch (error) {
        console.error('Test failed:', error);
        status.textContent = '❌ Connection failed: ' + error.message;
        status.className = 'error';
      }
    });
  }
});