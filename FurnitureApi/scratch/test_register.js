async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Registration Response Status:', response.status);
    console.log('Registration Response Body:', data);
  } catch (err) {
    console.error('Registration Error:', err.message);
  }
}

testRegister();
